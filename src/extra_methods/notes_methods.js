import * as MidiWriter from 'midi-writer-js';

/**
 * Flatten MIDI data according to expansion plist order
 * Works with { type: "ending"|"section", notes: [...] }; structure
 *
 * @param {Object}; midiDataBySection - { "section-1": {type, notes}; "ending-1": {...}; ... };
 * @param {Document}; meiDoc - MEI DOM containing <expansion> with plist
 * @returns {Array}; flattened MIDI data in playback order
 */
const getMidiDataByExpansionAllSections = (vT, meiDoc) => {
    const NS_XML = "http://www.w3.org/XML/1998/namespace";
    const expansion = meiDoc.querySelector("expansion");
    //console.log("Expansion found:", expansion);
    if (!expansion) return {};

    const plist = expansion.getAttribute("plist").split(" ").map(s => s.trim());
    //console.log("Plist items:", plist);

    const midiDataBySection = {};

    plist.forEach(idRef => {
        const sectionId = idRef.replace("#", "");
        //console.log("Looking for section:", sectionId);

        // Search for element by xml:id attribute
        let sectionEl = null;
        const allElements = Array.from(meiDoc.getElementsByTagName("*"));

        for (let el of allElements) {
            const xmlId = el.getAttributeNS(NS_XML, "id") || el.getAttribute("xml:id");
            if (xmlId === sectionId) {
                sectionEl = el;
                break;
            };
        };

        if (!sectionEl) {
            console.warn("Section not found:", sectionId);
            return;
        };

        //console.log(`Found element: <${sectionEl.tagName};> with id="${sectionId};"`);

        // Collect all notes recursively
        const notes = Array.from(sectionEl.getElementsByTagName("note"));
        //console.log(`Found ${notes.length}; notes in ${sectionId};`);

        midiDataBySection[sectionId] = {
            type: sectionEl.tagName.toLowerCase(),
            notes: []
        };

        for (let noteEl of notes) {
            const noteId = noteEl.getAttributeNS(NS_XML, "id") || noteEl.getAttribute("xml:id");
            if (!noteId) continue;

            const midiVals = vT.getMIDIValuesForElement(noteId);
            if (midiVals) {
                midiDataBySection[sectionId].notes.push({
                    index: noteId,
                    pitch: midiVals.pitch,
                    time: midiVals.time,
                    duration: midiVals.duration
                });
            };
        };

        //console.log(`Collected ${midiDataBySection[sectionId].notes.length}; MIDI notes for ${sectionId};`);
    });

    return midiDataBySection;
};

/**
 * Flatten MIDI data according to expansion plist order
 * Works with { type: "ending"|"section", notes: [...] }; structure
 *
 * @param {Object}; midiDataBySection - { "section-1": {type, notes}; "ending-1": {...}; ... };
 * @param {Document}; meiDoc - MEI DOM containing <expansion> with plist
 * @returns {Array}; flattened MIDI data in playback order
 */
const flattenMidiByExpansion = (midiDataBySection, meiDoc) => {
    const expansion = meiDoc.querySelector("expansion");
    if (!expansion) return [];

    const plist = expansion.getAttribute("plist").split(" ");
    const flatMidi = [];
    let currentTime = 0;

    plist.forEach((idRef) => {
        const sectionId = idRef.replace("#", "");
        const sectionData = midiDataBySection[sectionId];
        if (!sectionData || !Array.isArray(sectionData.notes)) return;

        const notes = sectionData.notes;
        if (notes.length === 0) return;

        // Find the start time of this section (minimum note time)
        const sectionStartTime = Math.min(...notes.map(n => n.time));

        // Append notes, shifting times so playback is continuous
        notes.forEach(note => {
            flatMidi.push({
                ...note,
                time: note.time - sectionStartTime + currentTime, // shift relative to section
            });
        });

        // Update currentTime to end of this section/ending
        const sectionEndTime = Math.max(...notes.map(n => n.time + n.duration)) - sectionStartTime;
        currentTime += sectionEndTime;
    });

    return flatMidi;
};



/**
 * Convert Uint8Array or ArrayBuffer to base64
*/
const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000; // for large files

    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, chunk);
    };

    return btoa(binary);
};

/**
 * Convert ticks to MidiWriter.js duration string.
 * @param {number} ticks - Duration in ticks
 * @param {number} ticksPerQuarter - Ticks per quarter note (e.g., 500)
 * @returns {string} Duration string for MidiWriter.js
 */
const ticksToMidiDuration = (ticks, ticksPerQuarter) => {
    const durations = [
        { name: "1", factor: 4 },        // whole
        { name: "d1", factor: 6 },        // dotted whole
        { name: "dd1", factor: 7 },        // double dotted whole (7/4 of quarter)
        { name: "2", factor: 2 },        // half
        { name: "d2", factor: 3 },        // dotted half
        { name: "dd2", factor: 3.5 },      // double dotted half
        { name: "4", factor: 1 },        // quarter
        { name: "4t", factor: 2 / 3 },      // quarter triplet
        { name: "d4", factor: 1.5 },      // dotted quarter
        { name: "dd4", factor: 1.75 },     // double dotted quarter
        { name: "8", factor: 0.5 },      // eighth
        { name: "8t", factor: 1 / 3 },      // eighth triplet
        { name: "d8", factor: 0.75 },     // dotted eighth
        { name: "dd8", factor: 0.875 },    // double dotted eighth
        { name: "16", factor: 0.25 },     // sixteenth
        { name: "16t", factor: 1 / 6 },      // sixteenth triplet
        { name: "32", factor: 0.125 },    // thirty-second
        { name: "64", factor: 0.0625 }    // sixty-fourth
    ];

    let closest = durations[0];
    let minDiff = Infinity;

    durations.forEach(d => {
        const durTicks = d.factor * ticksPerQuarter;
        const diff = Math.abs(durTicks - ticks);
        if (diff < minDiff) {
            minDiff = diff;
            closest = d;
        }
    });

    return closest.name;
};

const getTimeSignatureFromMEI = (meiDoc,  default_meterSig = { count: 4, unit: 4 }) => {

    // Try to find <meterSig> anywhere in the MEI tree
    const meterSig = meiDoc.querySelector("meterSig");
    if (!meterSig) return default_meterSig;

    // <meterSig> may contain attributes like meter.count="4" and meter.unit="4"
    const count = parseInt(meterSig.getAttribute("count") || meterSig.getAttribute("meter.count"));
    const unit = parseInt(meterSig.getAttribute("unit") || meterSig.getAttribute("meter.unit"));

    if (isNaN(count) || isNaN(unit)) return default_meterSig;

    return { count, unit };
};

/**
 * Finds the first quarter note (<note dur="4"/>) in an MEI DOM.
 * If none exists, finds the first smaller note (dur=8,16,32,64),
 * or as a final fallback, a half note (dur="2").
 *
 * Returns:
 *   { id: string, type: "quarter" | "smaller" | "half" } or null
 */
const getFirstQuarterOrSmallerNoteInfo = (meiDoc) => {
    if (!meiDoc) return null;

    // Try quarter note first
    const quarterNote = meiDoc.querySelector('note[dur="4"]');
    if (quarterNote) {
        return {
            id: quarterNote.getAttribute("xml:id"),
            type: "quarter",
        };
    }

    // Try smaller durations
    const smallerNote = meiDoc.querySelector(
        'note[dur="8"], note[dur="16"], note[dur="32"], note[dur="64"]'
    );
    if (smallerNote) {
        return {
            id: smallerNote.getAttribute("xml:id"),
            type: "smaller", // smaller than quarter
        };
    }

    // Fallback to half note
    const halfNote = meiDoc.querySelector('note[dur="2"]');
    if (halfNote) {
        return {
            id: halfNote.getAttribute("xml:id"),
            type: "half",
        };
    }

    // None found
    return null;
};

/**
 * Extracts BPM (tempo) value from MEI tree.
 * Looks for <tempo> or <metronome> elements.
 * Returns a number (default 120 if not found).
 */
const getBPMFromMEI = (meiTree) => {
    if (!meiTree) return 120;

    // Search for <tempo> or <metronome> elements
    const tempoEl = meiTree.querySelector("tempo, metronome");
    if (!tempoEl) return 120;

    // Try standard MEI attributes
    const bpmAttr = tempoEl.getAttribute("mm") || tempoEl.getAttribute("bpm");
    if (bpmAttr && !isNaN(parseFloat(bpmAttr))) {
        return parseFloat(bpmAttr);
    }

    // Try textual content like "♩=90" or "quarter=100"
    const text = tempoEl.textContent.trim();
    const match = text.match(/(?:♩|quarter)\s*=?\s*(\d+)/);
    if (match) return parseFloat(match[1]);

    return 120; // fallback default
};

/**
 * 
 * @param {*} flatMidi 
 * @param {*} ticksPerQuarter 
 * @param {*} bpm 
 * @param {*} timeSn 
 * @param {*} timeSd 
 * @returns 
 */
export const renderMidiToBase64 = (flatMidi, ticksPerQuarter = 750, bpm = 100, timeSn = 2, timeSd = 4) => {
    const track = new MidiWriter.Track();
    track.setTempo(bpm);
    track.setTimeSignature(timeSn, timeSd);

    // Sort notes by start time
    flatMidi.sort((a, b) => a.time - b.time);

    let lastTime = 0;

    flatMidi.forEach((note, i) => {
        const waitTicks = note.time - lastTime; // already in ticks
        const isLast = i === flatMidi.length - 1;
        const durationTicks = isLast ? note.duration + ticksPerQuarter * 2: note.duration;

        track.addEvent(
            new MidiWriter.NoteEvent({
                pitch: [note.pitch],
                duration: ticksToMidiDuration(durationTicks, ticksPerQuarter),
                wait: ticksToMidiDuration(waitTicks, ticksPerQuarter),
            })
        );

        lastTime = note.time + durationTicks;
    });

    const writer = new MidiWriter.Writer(track);
    const midiArrayBuffer = writer.buildFile(); // Uint8Array in browser
    return arrayBufferToBase64(midiArrayBuffer);
};


/**
 * Get Notes With Expansion
 * @param {Document}; vT - verovio toolkit object
 * @param {Document}; meiDoc - MEI DOM containing <expansion> with plist
 * @returns {Array}; flatMidi - [{pitch, time, duration, index}; ...] with time/duration in ms
 */
export const getNotesExpanded = (vT, meiTree) => {
    let midiDataBySection = getMidiDataByExpansionAllSections(vT, meiTree);
    return flattenMidiByExpansion(midiDataBySection, meiTree);
};

/**
 * 
 * @param {*} vT 
 * @param {*} meiTree 
 * @returns 
 */
export const getMIDI = (vT, meiTree) => {
    const notesExp = getNotesExpanded(vT, meiTree);

    // Extract time signature and BPM from MEI
    const ts = getTimeSignatureFromMEI(meiTree);
    const bpm = getBPMFromMEI(meiTree);

    // Find first relevant note (quarter, smaller, or half)
    const firstNoteInfo = getFirstQuarterOrSmallerNoteInfo(meiTree);

    if (firstNoteInfo) {
        // Get corresponding MIDI values
        const elMidi = vT.getMIDIValuesForElement(firstNoteInfo.id);
        let tpq = elMidi.duration;

        // Adjust ticks-per-beat based on note type
        if (firstNoteInfo.type === "smaller") { // e.g., eighth
            tpq *= 2;
        } else if (firstNoteInfo.type === "half") {
            tpq /= 2;
        }
        // quarter → leave as is

        // Render MIDI as base64
        return renderMidiToBase64(notesExp, tpq, bpm, ts.count, ts.unit);
    }
    return vT.renderToMIDI();
};
