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
    midiPitches.forEach((element,_) => {
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

    intervals.forEach((element,_) => {
        console.log(element, element % 13 + 12)
        histogram[element % 13 + 12]++;
    });

    return histogram;
};

/**
 * Get Structural Patterns - Rhythm Pattern
 * @param {*} vT 
 * @param {*} meiTree 
 */
export const getAutomaticStructuralPattern_R = (vT) => {

};



