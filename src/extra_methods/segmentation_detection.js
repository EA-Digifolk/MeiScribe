// segmentation_detection.js

import { getXpathNode } from "./mei_methods";
import { getNotesExpanded } from "./notes_methods";

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



export const getAutomaticSegmentation = (vT, meiTree) => {

    let midiDataC = getNotesExpanded(vT, meiTree);

    // Get boundaries based on the MIDI data
    const boundaries = calculateBoundaryScores(midiDataC);

    console.log("Detected boundaries:", boundaries);

};