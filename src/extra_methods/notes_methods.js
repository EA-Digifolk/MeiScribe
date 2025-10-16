
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
 * Convert MIDI number to note name, e.g., 60 -> "C4"
 */
const midiToNoteName = (midi) => {
    const octave = Math.floor(midi / 12) - 1;
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    return noteNames[midi % 12] + octave;
};

/**
 * Render flat MIDI notes to a base64-encoded string
 * @param {Array}; flatMidi - [{pitch, time, duration, index}; ...] with time/duration in ms
 * @returns {string}; base64-encoded MIDI file
 */
export const renderMidiToBase64 = (flatMidi, bpm = 120) => {
    const track = new MidiWriter.Track();
    track.setTempo(bpm);

    const TICKS_PER_BEAT = 48;
    const msPerBeat = 60000 / bpm;

    flatMidi.sort((a, b) => a.time - b.time);
    let lastTime = 0;

    flatMidi.forEach(note => {
        const waitTicks = Math.round(((note.time - lastTime) / msPerBeat) * TICKS_PER_BEAT);
        const durationTicks = Math.round((note.duration / msPerBeat) * TICKS_PER_BEAT);

        track.addEvent(
            new MidiWriter.NoteEvent({
                pitch: [midiToNoteName(note.pitch)],
                duration: "T" + durationTicks,
                wait: "T" + waitTicks,
            })
        );

        lastTime = note.time;
    });

    const writer = new MidiWriter.Writer(track);
    const midiArrayBuffer = writer.buildFile(); // in browser this is Uint8Array
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
    console.log(midiDataBySection);

    return flattenMidiByExpansion(midiDataBySection, meiTree);
};