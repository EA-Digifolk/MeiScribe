// segmentation_detection.js

import { getXpathNode } from "./mei_methods";

import * as music21 from 'music21j';

const calculateBoundaryScores = (midiData) => {
    const boundaryScores = [];
    const threshold = 0.5; // Boundary detection threshold (tune based on your needs)

    // Helper function to calculate interval (pitch difference)
    const calculatePitchInterval = (note1, note2) => {
        return Math.abs(note1 - note2);
    };

    // Helper function to calculate inter-onset interval (IOI)
    const calculateIOI = (time1, time2) => {
        return Math.abs(time1 - time2);
    };

    // Iterate through the MIDI data and calculate boundary scores
    for (let i = 1; i < midiData.length; i++) {
        const currentNote = midiData[i];
        const previousNote = midiData[i - 1];

        const pitchInterval = calculatePitchInterval(previousNote.note, currentNote.note);
        const ioi = calculateIOI(previousNote.time, currentNote.time);

        // Combine features to calculate a simple boundary score
        const boundaryScore = pitchInterval * 0.5 + ioi * 0.5;

        // Store the boundary score for the current note
        boundaryScores.push({ time: currentNote.time, score: boundaryScore });
    };

    // Flag points as boundaries where the score exceeds the threshold
    const boundaries = boundaryScores.filter((entry) => entry.score > threshold);

    return boundaries;
};

export const getAutomaticSegmentation = (vT, meiTree) => {

    // Example MIDI data (note, time)
    const midiData = [
        { note: 60, time: 0 },
        { note: 62, time: 480 },
        { note: 64, time: 960 },
        { note: 67, time: 1440 },
        { note: 60, time: 1920 },
        { note: 69, time: 2400 }
    ];

    // Get boundaries based on the MIDI data
    const boundaries = calculateBoundaryScores(midiData);

    console.log("Detected boundaries:", boundaries);

};