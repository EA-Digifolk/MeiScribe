
export const getAutomaticAmbitus = (vT, low=true) => {
    // calculate ambitus from score
    let midiPitches = vT.getDescriptiveFeatures()['pitchesIds'].map((element, index) => {
        return vT.getMIDIValuesForElement(element[0])['pitch'];
    });

    if (!low) {
        return Math.max.apply(null, midiPitches);
    } 
    return Math.min.apply(null, midiPitches);
};