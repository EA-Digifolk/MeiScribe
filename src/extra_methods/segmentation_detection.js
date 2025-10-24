// segmentation_detection.js

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

function getBoundariesAndSegments(notes) {

    // --- 1. Compute mean and std ---
    const scores = notes.map(n => n.score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    const std = Math.sqrt(variance);

    // --- 2. Compute threshold ---
    const threshold = mean + 1.5 * std;

    // --- 3. Sort notes by time just in case ---
    notes.sort((a, b) => a.time - b.time);

    // --- 4. Identify boundary indices (numeric positions in array) ---
    const boundaryIndices = notes
        .map((n, i) => ({ i, score: n.score }))
        .filter(n => n.score > threshold)
        .map(n => n.i);

    // --- 5. Build non-overlapping segments ---
    const startIndex = 0;
    const endIndex = notes.length - 1;
    const indices = [startIndex, ...boundaryIndices, endIndex];

    const segments = [];

    for (let i = 0; i < indices.length - 1; i++) {
        const segmentStart = i === 0 ? indices[i] : indices[i] + 1;
        const segmentEnd = indices[i + 1];

        if (segmentStart <= segmentEnd) {
            segments.push({
                startIndex: segmentStart,
                endIndex: segmentEnd,
                startNoteID: notes[segmentStart].index,
                endNoteID: notes[segmentEnd].index,
                notes: notes.slice(segmentStart, segmentEnd + 1) // optional: full note objects
            });
        }
    }

    return { mean, std, threshold, boundaryIndices, segments };
};

function buildSegmentSimilarityTable(segments, notes) {
    const n = segments.length;
    const table = Array.from({ length: n }, () => Array(n).fill(0));

    // Helper: get array of [pitch, duration] vectors for a segment
    function getVectors(segment) {
        return notes
            .slice(segment.startIndex, segment.endIndex + 1)
            .map(n => [n.pitch, n.duration]); // assuming notes have pitch & duration
    }

    // Compute Euclidean distance between two sequences of vectors
    function euclideanDistanceVectors(arrA, arrB) {
        const length = Math.min(arrA.length, arrB.length);
        let sum = 0;
        for (let i = 0; i < length; i++) {
            const dx = arrA[i][0] - arrB[i][0]; // pitch difference
            const dy = arrA[i][1] - arrB[i][1]; // duration difference
            sum += dx * dx + dy * dy;
        }
        return Math.sqrt(sum);
    }

    // Build the similarity table
    for (let i = 0; i < n; i++) {
        const vectorsA = getVectors(segments[i]);
        for (let j = 0; j < n; j++) {
            if (i === j) {
                table[i][j] = 0; // distance to itself
            } else {
                const vectorsB = getVectors(segments[j]);
                table[i][j] = euclideanDistanceVectors(vectorsA, vectorsB);
            }
        }
    }

    return table;
};

function labelSegmentsBySimilarity(segments, similarityTable, threshold = 50) {
    const labels = [];
    let nextLabelCharCode = 'A'.charCodeAt(0);

    for (let i = 0; i < segments.length; i++) {
        if (i === 0) {
            labels.push(String.fromCharCode(nextLabelCharCode)); // first segment = 'A'
            continue;
        }

        let assigned = false;
        for (let j = 0; j < i; j++) {
            if (similarityTable[i][j] <= threshold) {
                // similar to a previous segment → use the same label
                labels.push(labels[j]);
                assigned = true;
                break;
            }
        }

        if (!assigned) {
            // assign a new label
            nextLabelCharCode++;
            labels.push(String.fromCharCode(nextLabelCharCode));
        }
    }

    // add labels to segments
    segments.forEach((seg, idx) => (seg.label = labels[idx]));
    return segments;
};


export const getAutomaticSegmentation = (vT, meiTree) => {

    let midiDataC = getNotesExpanded(vT, meiTree);

    // Get boundaries based on the MIDI data
    const lbdmScores = calculateBoundaryScores(midiDataC);
    const fnote = midiDataC[0];
    fnote.score = 0;
    lbdmScores.unshift(fnote);

    // Get Segments from threshold
    const result = getBoundariesAndSegments(lbdmScores);

    // Get Labels from Similarity
    const similarityTable = buildSegmentSimilarityTable(result.segments, midiDataC);
    labelSegmentsBySimilarity(result.segments, similarityTable);

    return result.segments;
};