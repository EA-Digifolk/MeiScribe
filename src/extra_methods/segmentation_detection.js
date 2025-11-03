// segmentation_detection.js

import { getNotesExpanded } from "./notes_methods";
import { getXpathNode } from "./mei_methods";

// Helper function to calculate interval (pitch difference)
const calculatePitchInterval = (note1, note2) => {
    return Math.abs(note1 - note2);
};

// Helper function to calculate inter-onset interval (IOI)
const calculateIOI = (time1, time2) => {
    return Math.abs(time1 - time2);
};

const calculateRestBetweenNotes = (note1, note2) => {
    return Math.max(0, note2.time - (note1.time + note1.duration));
};

const calculateBoundaryScores = (midiData, weights = { pitch: .25, ioi: .25, rest: .5 }) => {
    const boundaryScores = [];

    // Iterate through the MIDI data and calculate boundary scores
    for (let i = 1; i < midiData.length; i++) {
        const currentNote = midiData[i];
        const previousNote = midiData[i - 1];

        const pitchInterval = calculatePitchInterval(previousNote.pitch, currentNote.pitch);
        const ioi = calculateIOI(previousNote.time, currentNote.time);
        const restDuration = calculateRestBetweenNotes(previousNote, currentNote);

        // Combine features to calculate a simple boundary score
        const boundaryScore = pitchInterval * weights.pitch + ioi * weights.ioi + restDuration * weights.rest;

        // Store the boundary score for the current note
        boundaryScores.push({
            index: currentNote.index, time: currentNote.time, pitch: currentNote.pitch, duration: currentNote.duration,
            ioi: ioi, pitchInt: pitchInterval, rest: restDuration, score: boundaryScore
        });
    };

    return boundaryScores;
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
        .map(n => n.i - 1);

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

// Compute Euclidean distance between two sequences of vectors
const euclideanDistanceVectors = (arrA, arrB) => {
    const length = Math.min(arrA.length, arrB.length);
    let sum = 0;
    for (let i = 0; i < length; i++) {
        const dx = arrA[i][0] - arrB[i][0]; // pitch difference
        const dy = arrA[i][1] - arrB[i][1]; // duration difference
        sum += dx * dx + dy * dy;
    }
    return Math.sqrt(sum);
}

// Compute SIAM score between two sequences of vectors
const siamScoreVectors = (arrA, arrB) => {

    // Helper: subtract two arrays element-wise
    function subtractArrays(a, b) {
        return a.map((val, i) => val - b[i]);
    }

    // Create table of vectors
    function createVectorTable(datapoints1, datapoints2) {
        const rows = datapoints1.length;
        const cols = datapoints2.length;
        const dim = datapoints1[0].length;
        const vectorTable = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => Array(dim).fill(0))
        );

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                vectorTable[i][j] = subtractArrays(datapoints1[i], datapoints2[j]);
            }
        }
        return vectorTable;
    }

    // Flatten nested arrays (like itertools.chain)
    function flatten(arr) {
        return arr.reduce((acc, val) => acc.concat(val), []);
    }

    // Count occurrences of each translation vector (MTPnew)
    function MTPnew(vectorTable) {
        const flat = flatten(vectorTable).map(v => JSON.stringify(v));
        const counts = {};
        flat.forEach(v => counts[v] = (counts[v] || 0) + 1);
        return Object.values(counts);
    }

    // Count occurrences of a specific translation vector
    function MTP(vectorTable, transVector) {
        let count = 0;
        const transStr = JSON.stringify(transVector);
        for (const row of vectorTable) {
            for (const vec of row) {
                if (JSON.stringify(vec) === transStr) {
                    count++;
                }
            }
        }
        return count;
    }

    // Print vector table in a human-readable form
    function printVectorTable(vectorTable, seq1, seq2) {
        console.log("Vector Table:");
        const header = [" "].concat(seq2.map(s => JSON.stringify(s)));
        console.log(header.join("\t"));
        for (let i = 0; i < seq1.length; i++) {
            const row = [JSON.stringify(seq1[i])];
            for (let j = 0; j < seq2.length; j++) {
                row.push(JSON.stringify(vectorTable[i][j]));
            }
            console.log(row.join("\t"));
        }
    }

    // Print lexicographical table
    function printLexicographicalTable(vectorTable, seq2) {
        const flat = flatten(vectorTable);
        const uniqueVecs = Array.from(new Set(flat.map(v => JSON.stringify(v))))
            .map(s => JSON.parse(s))
            .sort((a, b) => a[0] - b[0]);

        for (const st of uniqueVecs) {
            const stStr = JSON.stringify(st);
            const indices = [];
            for (let i = 0; i < vectorTable.length; i++) {
                for (let j = 0; j < vectorTable[i].length; j++) {
                    if (JSON.stringify(vectorTable[i][j]) === stStr) {
                        indices.push(j);
                    }
                }
            }
            const seqs = indices.map(i => JSON.stringify(seq2[i]));
            console.log(`${stStr} -> ${seqs.join(", ")}`);
        }
    }

    const vectorTable = createVectorTable(arrA, arrB);
    const mtps1 = MTPnew(vectorTable);
    return Math.max(...mtps1) / Math.max(arrA.length, arrB.length);
};

function buildSegmentSimilarityTable(segments, notes, algorithm = 'Euclidean') {
    const n = segments.length;
    let table = Array.from({ length: n }, () => Array(n).fill(0));

    // Helper: get array of [pitch, duration] vectors for a segment
    function getVectors(segment) {
        return notes
            .slice(segment.startIndex, segment.endIndex + 1)
            .map(n => [n.pitch, n.duration]); // assuming notes have pitch & duration
    }

    function distanceToSimilarityMinMax(dist) {
        const n = dist.length;
        let min = Infinity, max = -Infinity;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const v = dist[i][j];
                if (v < min) min = v;
                if (v > max) max = v;
            }
        }

        // If all distances equal, fallback: distances==0 -> similarity 1, else 0
        if (max === min) {
            return dist.map(row => row.map(v => (v === min ? 1 : 0)));
        }

        const sim = Array.from({ length: n }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const v = dist[i][j];
                const normalized = (v - min) / (max - min); // in [0,1]
                sim[i][j] = 1 - normalized; // invert -> 1 for smallest distance
            }
        }
        return sim;
    };

    // Build the similarity table
    for (let i = 0; i < n; i++) {
        const vectorsA = getVectors(segments[i]);
        for (let j = 0; j < n; j++) {
            if (i === j) {
                table[i][j] = algorithm === 'Euclidean' ? 0 : 1; // distance to itself
            } else {
                const vectorsB = getVectors(segments[j]);
                switch (algorithm) {
                    case 'Euclidean':
                        table[i][j] = euclideanDistanceVectors(vectorsA, vectorsB);
                        break;
                    case 'SIAM':
                    default:
                        table[i][j] = siamScoreVectors(vectorsA, vectorsB);
                        break;
                }

            }
        }
    };

    if (algorithm === 'Euclidean') {
        table = distanceToSimilarityMinMax(table);
    };
    return table;
};

function labelSegmentsBySimilarity(segments, similarityTable, threshold = .7) {
    const labels = [];
    let nextLabelCharCode = 'A'.charCodeAt(0);

    for (let i = 0; i < segments.length; i++) {
        if (i === 0) {
            labels.push(String.fromCharCode(nextLabelCharCode)); // first segment = 'A'
            continue;
        }

        let assigned = false;
        for (let j = 0; j < i; j++) {
            if (similarityTable[i][j] >= threshold) {
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

    const country = getXpathNode(meiTree, './/mei:workList//mei:term[@type="country"]').textContent;

    let weights = { pitch: .25, ioi: .25, rest: .5 };
    switch (country) {
        case 'Portugal':
            weights = { pitch: .21, ioi: .34, rest: .42 };
            break;
        case 'Spain':
            weights = { pitch: .22, ioi: .28, rest: .49 };
            break;
        default:
            break;
    };

    // Get boundaries based on the MIDI data
    const lbdmScores = calculateBoundaryScores(midiDataC, weights);

    const fnote = midiDataC[0];
    fnote.score = 0;
    fnote.ioi = fnote.time;
    fnote.pitchInt = 0; 
    fnote.rest = 0;
    lbdmScores.unshift(fnote);

    console.table(lbdmScores);

    // Get Segments from threshold
    const result = getBoundariesAndSegments(lbdmScores);

    // Get Labels from Similarity
    const similarityTable = buildSegmentSimilarityTable(result.segments, midiDataC, 'SIAM');
    labelSegmentsBySimilarity(result.segments, similarityTable);

    return result.segments;
};