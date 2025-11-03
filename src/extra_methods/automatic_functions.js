// automatic_functions.js

import { getXpathNode } from './mei_methods'
import * as music21 from 'music21j';

/**
 * 
 * @param {*} vT 
 * @param {*} low 
 * @returns 
 */
export const getAutomaticAmbitus = (vT, low = true) => {
    // calculate ambitus from score
    let midiPitches = vT.getDescriptiveFeatures()['pitchesIds'].map((element, _) => {
        return vT.getMIDIValuesForElement(element[0])['pitch'];
    });

    if (!low) {
        return Math.max.apply(null, midiPitches);
    }
    return Math.min.apply(null, midiPitches);
};



/**
 * 
 * @param {*} timeSig
 *      timeSig[0] -> count (2,3,4,6,9,12,etc)
 *      timeSig[1] -> unit (2,4,8,16)
 *      timeSig[3] -> sym ('cut' for 2/2, for example)
 */
const getMeterFromTimeSignature = (timeSig) => {
    if (!timeSig[0]) {
        return 'Free';
    } else if (timeSig[0] % 2 == 0) {
        return 'Binary';
    } else if (timeSig[0] % 3 == 0) {
        return 'Ternary';
    } else {
        return 'Polyrhythm';
    }
}

/**
 * 
 * @param {*} vT 
 * @param {*} low 
 * @returns 
 */
export const getAutomaticMeterTempo = (meiTree) => {

    let meter = 'Binary';
    let tempo = '';

    let xmS = getXpathNode(meiTree, './/mei:meterSig', true);

    let meterSigs = [];
    let node = null;
    while ((node = xmS.iterateNext())) {
        let metS = [node.getAttribute('count'), node.getAttribute('unit'), node.getAttribute('sym')];
        meterSigs.push(getMeterFromTimeSignature(metS));
    };

    if (meterSigs.length > 1) {
        if (meterSigs.every((val, _, arr) => val === arr[0])) {
            meter = meterSigs[0];
        } else {
            meter = 'Polyrhythm';
        }
    } else {
        meter = meterSigs[0];
    }

    let tpS = getXpathNode(meiTree, './/mei:tempo');
    if (tpS) {
        tempo = tpS.textContent;
    }

    return [meter, tempo];
};

/**
 * Get Structural Patterns - Pitch Pattern
 * @param {*} vT 
 * @param {*} meiTree 
 */
export const getAutomaticStructuralPattern_P = (vT) => {
    let midiPitches = vT.getDescriptiveFeatures()['pitchesIds'].map((element, _) => {
        return vT.getMIDIValuesForElement(element[0])['pitch'];
    });

    // Initialize histogram with 12 bins (for 12 pitch classes)
    let histogram = Array(12).fill(0);

    // Count occurrences
    midiPitches.forEach((element, _) => {
        histogram[element % 12]++;
    });

    return histogram;
};

/**
 * Get Structural Patterns - Interval Pattern
 * @param {*} vT 
 * @param {*} meiTree 
 */
export const getAutomaticStructuralPattern_I = (vT) => {
    let midiPitches = vT.getDescriptiveFeatures()['pitchesIds'].map((element, _) => {
        return vT.getMIDIValuesForElement(element[0])['pitch'];
    });

    let intervals = [];
    for (let i = 1; i < midiPitches.length; i++) {
        intervals.push(midiPitches[i] - midiPitches[i - 1]);
    }

    let histogram = Array(25).fill(0);

    intervals.forEach((element, _) => {
        //console.log(element, element % 13 + 12)
        histogram[element % 13 + 12]++;
    });

    return histogram;
};


const analyzeRhythm = (notes) => {

    function estimateTactus(iois) {
        const clusters = [];
        for (const ioi of iois) {
            const match = clusters.find(c => Math.abs(c.mean - ioi) < 0.2 * c.mean);
            if (match) {
                match.values.push(ioi);
                match.mean = match.values.reduce((a, b) => a + b, 0) / match.values.length;
            } else {
                clusters.push({ mean: ioi, values: [ioi] });
            }
        }
        // pick largest cluster by count
        clusters.sort((a, b) => b.values.length - a.values.length);
        return clusters[0]?.mean || iois[0];
    }

    function estimateCycleLength(onsets, tactus) {
        const beats = onsets.map(t => Math.round(t / tactus));
        const maxBeat = Math.max(...beats);
        const sequence = new Array(maxBeat + 1).fill(0);
        beats.forEach(b => sequence[b]++);

        const acf = [];
        for (let lag = 1; lag < Math.min(16, sequence.length / 2); lag++) {
            let sum = 0;
            for (let i = 0; i < sequence.length - lag; i++) {
                sum += sequence[i] * sequence[i + lag];
            }
            acf.push(sum);
        }

        // Pick the lag (period) with the strongest correlation peak
        const bestLag = acf.indexOf(Math.max(...acf)) + 1;
        return bestLag;
    }

    function estimateOptimalResolution(iois, tactus) {
        const fractions = [1, 1 / 2, 1 / 3, 1 / 4, 1 / 6, 1 / 8];
        let best = { frac: 1, error: Infinity };

        for (const f of fractions) {
            const unit = tactus * f;
            const error = iois.reduce((sum, ioi) => {
                const q = Math.round(ioi / unit) * unit;
                return sum + Math.abs(ioi - q);
            }, 0);
            if (error < best.error) best = { frac: f, error };
        }
        return best.frac;
    }

    function resolutionNameFromFraction(f) {
        if (f === 1) return "quarter";
        if (f === 0.5) return "8th";
        if (f === 0.25) return "16th";
        if (f === 0.125) return "32nd";
        if (f === 1 / 3) return "triplet-quarter";
        if (f === 1 / 6) return "triplet-8th";
        return `${f * 4}-subdivision`;
    }

    const onsets = notes.map(n => n.time).sort((a, b) => a - b);
    const iois = onsets.slice(1).map((t, i) => t - onsets[i]);
    const tactus = estimateTactus(iois);
    const cycleLength = estimateCycleLength(onsets, tactus);
    const resolutionFrac = estimateOptimalResolution(iois, tactus);
    const resolutionName = resolutionNameFromFraction(resolutionFrac);

    return { tactus, cycleLength, resolutionName };
}

/**
 * Get Structural Patterns - Rhythm Pattern
 * @param {*} vT 
 * @param {*} meiTree 
 */
export const getAutomaticStructuralPattern_R = (vT) => {
    let notes = vT.getDescriptiveFeatures()['pitchesIds'].map((element, _) => {
        return vT.getMIDIValuesForElement(element[0]);
    });

    const { tactus, cycleLength, resolutionName } = analyzeRhythm(notes);

    const bins = new Array(cycleLength).fill(0);

    for (const note of notes) {
        // Compute which beat (tactus index) the note belongs to
        const startBeat = Math.floor(note.time / tactus) % cycleLength;
        const endBeat = Math.floor((note.time + note.duration) / tactus) % cycleLength;

        // Distribute note duration proportionally within affected beats
        for (let i = startBeat; i <= endBeat; i++) {
            const idx = i % cycleLength;
            bins[idx] += note.duration / tactus;
        }
    }

    // Normalize to 100%
    const total = bins.reduce((a, b) => a + b, 0);
    const normalized = bins.map(v => Number.parseFloat((v / total) * 100).toFixed(2));

    return { value: normalized, optimal_resolution: resolutionName };
};



