// segmentation_detection.js

import { getXpathNode } from "./mei_methods";

// Helper function to calculate interval (pitch difference)
const calculatePitchInterval = (note1, note2) => {
    return Math.abs(note1 - note2);
};

// Helper function to calculate inter-onset interval (IOI)
const calculateIOI = (time1, time2) => {
    return Math.abs(time1 - time2);
};

const calculateBoundaryScores = (midiData) => {
    const boundaryScores = [];
    const threshold = 0.5; // Boundary detection threshold (tune based on your needs)

    // Iterate through the MIDI data and calculate boundary scores
    for (let i = 1; i < midiData.length; i++) {
        const currentNote = midiData[i];
        const previousNote = midiData[i - 1];

        const pitchInterval = calculatePitchInterval(previousNote.pitch, currentNote.pitch);
        const ioi = calculateIOI(previousNote.time, currentNote.time);

        // Combine features to calculate a simple boundary score
        const boundaryScore = pitchInterval * 0.5 + ioi * 0.5;

        // Store the boundary score for the current note
        boundaryScores.push({ index: currentNote.index, time: currentNote.time, score: boundaryScore });
    };

    // Flag points as boundaries where the score exceeds the threshold
    const boundaries = boundaryScores.filter((entry) => entry.score > threshold);

    return boundaries;
};

const getClosestNoteId = (time, notes) => {
    // Find the note whose onset is closest to the given time
    return notes.reduce((prev, curr) =>
        Math.abs(curr.time - time) < Math.abs(prev.time - time) ? curr : prev
    ).id;
};

const createPhraseStructure = (boundaryTimes, notes) => {
    const phrases = [];

    for (let i = 0; i < boundaryTimes.length - 1; i++) {
        const startTime = boundaryTimes[i];
        const endTime = boundaryTimes[i + 1];

        const startId = getClosestNoteId(startTime, notes);
        const endId = getClosestNoteId(endTime - 1, notes); // subtract a bit to avoid overlap

        phrases.push({
            n: i + 1,
            startid: `#${startId}`,
            endid: `#${endId}`,
            type: "Unlabeled"  // You can change this later
        });
    }

    return phrases;
};

function getMidiDataByExpansionAllSections(vT, meiDoc) {
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
            }
        }

        if (!sectionEl) {
            console.warn("Section not found:", sectionId);
            return;
        }

        //console.log(`Found element: <${sectionEl.tagName}> with id="${sectionId}"`);

        // Collect all notes recursively
        const notes = Array.from(sectionEl.getElementsByTagName("note"));
        //console.log(`Found ${notes.length} notes in ${sectionId}`);

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
            }
        }

        //console.log(`Collected ${midiDataBySection[sectionId].notes.length} MIDI notes for ${sectionId}`);
    });

    return midiDataBySection;
};

/**
 * Flatten MIDI data according to expansion plist order
 * Works with { type: "ending"|"section", notes: [...] } structure
 *
 * @param {Object} midiDataBySection - { "section-1": {type, notes}, "ending-1": {...}, ... }
 * @param {Document} meiDoc - MEI DOM containing <expansion> with plist
 * @returns {Array} flattened MIDI data in playback order
 */
function flattenMidiByExpansion(midiDataBySection, meiDoc) {
    const expansion = meiDoc.querySelector("expansion");
    if (!expansion) return [];

    const plist = expansion.getAttribute("plist").split(" ");
    const flatMidi = [];
    let currentTime = 0;

    plist.forEach((idRef) => {
        const sectionId = idRef.replace("#", "");
        const sectionData = midiDataBySection[sectionId];
        if (!sectionData || !Array.isArray(sectionData.notes)) return;

        // Append notes, shifting times so playback is continuous
        sectionData.notes.forEach((note) => {
            flatMidi.push({
                ...note,
                time: note.time + currentTime,
            });
        });

        // Update currentTime to end of this section/ending
        const notes = sectionData.notes;
        if (notes.length > 0) {
            const lastNote = notes[notes.length - 1];
            currentTime += lastNote.time + lastNote.duration;
        }
    });

    return flatMidi;
};

export const getNotesExpanded = (vT, meiTree) => {
    let midiDataBySection = getMidiDataByExpansionAllSections(vT, meiTree);
    return flattenMidiByExpansion(midiDataBySection, meiTree);
};

export const getAutomaticSegmentation = (vT, meiTree) => {

    let midiDataC = getNotesExpanded(vT, meiTree);

    // Get boundaries based on the MIDI data
    const boundaries = calculateBoundaryScores(midiDataC);

    console.log("Detected boundaries:", boundaries);

};