// automatic_functions.js

import * as music21 from 'music21j';

/**
 * 
 * @param {*} vT 
 * @param {*} low 
 * @returns 
 */
const getAutomaticAmbitus = (vT, low = true) => {
    // calculate ambitus from score
    let midiPitches = vT.getDescriptiveFeatures()['pitchesIds'].map((element, _) => {
        return vT.getMIDIValuesForElement(element[0])['pitch'];
    });

    if (!low) {
        return Math.max.apply(null, midiPitches);
    }
    return Math.min.apply(null, midiPitches);
};

const getAutomaticModeKey = () => {

};

const getAutomaticRhythmPattern = () => {

};

const getAutomaticSegmentation = () => {

};

export default {
    install: (app, options) => {
        app.provide('getAutomaticAmbitus', getAutomaticAmbitus);
        app.provide('getAutomaticModeKey', getAutomaticModeKey);
        app.provide('getAutomaticRhythmPattern', getAutomaticRhythmPattern);
        app.provide('getAutomaticSegmentation', getAutomaticSegmentation);
    }
  }