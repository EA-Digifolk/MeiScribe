// key_mode_detection.js

import { getXpathNode } from "./mei_methods";

const pitchClassToNoteSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const pitchClassToNoteFlat = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];

const MODE_TEMPLATES = {
    'Ionian': [2.20091184E-01, 2.25581292E-05, 1.46511995E-01, 5.36280445E-06, 1.77888928E-0, 8.36144654E-02, 2.38364675E-03, 1.80239869e-01, 3.86519474e-05, 1.10852124e-01, 1.68693543e-03, 7.66642797e-02],
    'Dorian': [0.22994192, 0., 0.1534614, 0.08798862, 0.0022751, 0.13517999, 0.0003637, 0.16981699, 0.00113331, 0.0470336, 0.17019451, 0.00261085],
    'Phrygian': [1.59081990e-01, 1.19053728e-01, 2.14560409e-02, 2.06695884e-01, 1.68693875e-02, 1.76308987e-01, 1.97893760e-02, 9.62954836e-02, 1.04412946e-01, 8.75774202e-03, 7.11622087e-02, 1.16225012e-04],
    'Lydian': [0.20333803, 0.01916849, 0.21942135, 0.00958425, 0.13741004, 0.10828567, 0., 0.14718088, 0.03169241, 0.03267859, 0.04201443, 0.04922586],
    'Mixolydian': [2.31645929e-01, 0.00000000e+00, 1.31770156e-01, 2.71510823e-03, 1.12991371e-01, 1.35224118e-01, 1.35800535e-04, 1.87723785e-01, 1.51386377e-04, 8.09722451e-02, 1.08194544e-01, 8.47555680e-03],
    'Aeolian': [0.21378083, 0., 0.13188807, 0.15675989, 0.00055762, 0.13737155, 0.00110359, 0.17974772, 0.04464784, 0.00363235, 0.12329431, 0.00721623],
    'Locrian': [0.15153131, 0.1875475, 0.132124, 0.02308868, 0.12832829, 0.05823564, 0.00357143, 0.02197802, 0.12250054, 0.12517042, 0.03309778, 0.01282639],
};

const KRUM_TEMPLATES = {
    'Major': [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88],
    'Minor': [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]
};

const rotateArray = (arr, n) => {
    return arr.slice(n).concat(arr.slice(0, n));
};

// Krumhansl-Kessler (KK) Rotated
const ionian = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const modeProfiles = {
    'Ionian': ionian,
    'Dorian': rotateArray(ionian, 10), // Dorian starts on 2nd degree
    'Phrygian': rotateArray(ionian, 8),
    'Lydian': rotateArray(ionian, 5),
    'Mixolydian': rotateArray(ionian, 7),
    'Aeolian': rotateArray(ionian, 9),
    'Locrian': rotateArray(ionian, 11),
    'Minor': [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]
};

const prettyRound = (num, decimals) => {
    return parseFloat(num.toFixed(decimals));
};

const normalize = (arr) => {
    const sum = arr.reduce((a, b) => a + b, 0);
    return arr.map(x => x / sum);
};

const dotProduct = (a, b) => {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
};

const pearsonCorrelation = (x, y) => {
    const n = x.length;
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        numerator += dx * dy;
        denomX += dx * dx;
        denomY += dy * dy;
    }

    return numerator / Math.sqrt(denomX * denomY);
};

/**
 * Krumhansl-Kessler (KK) key-finding algorithm
 */
const findBestMode = (pitchClassDistribution) => {
    pitchClassDistribution = normalize(pitchClassDistribution).map((item) => prettyRound(item, 8));
    let bestMatch = { root: null, mode: null, score: -Infinity };

    for (const [mode, profile] of Object.entries(KRUM_TEMPLATES)) {
        for (let root = 0; root < 12; root++) {
            const rotatedProfile = rotateArray(profile, root);
            const score = pearsonCorrelation(pitchClassDistribution, rotatedProfile);
            if (score > bestMatch.score) {
                bestMatch = { root, mode, score };
            }
        }
    }

    return bestMatch; // { root: 0–11, mode: 'dorian', score: 0.85 }
};




/**
 * 
 * @param {*} midiPitches 
 * @returns pitch class distribution histogram
 */
const getPitchClassDistribution = (midiPitches) => {
    let pcHistogram = [...Array(12).fill(0)];
    midiPitches.forEach((item) => {
        pcHistogram[item % 12] += 1;
    });
    return pcHistogram;
};

/**
 * 
 * @param {*} vT 
 * @param {*} low 
 * @returns 
 */
export const getAutomaticModeKey = (vT, xmlDoc) => {

    let midiPitches = vT.getDescriptiveFeatures()['pitchesIds'].map((element, _) => {
        return vT.getMIDIValuesForElement(element[0])['pitch'];
    });
    let pcHistogram = getPitchClassDistribution(midiPitches);
    let best_find = findBestMode(pcHistogram); // TODO: make it use key signature to find closest scores

    let note_root = pitchClassToNoteSharp[best_find.root];
    let signature = getXpathNode(xmlDoc, './/mei:keySig').getAttribute('sig');
    if (signature && signature.endsWith('f')) {
        note_root = pitchClassToNoteFlat[best_find.root];
    };

    return [note_root, best_find.mode, best_find.score];
};