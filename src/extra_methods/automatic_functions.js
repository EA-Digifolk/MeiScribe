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

export const getAutomaticRhythmPattern = (vT, meiTree) => {

};

