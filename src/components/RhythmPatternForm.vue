<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Rhythmic Patterns</h4> <button href="#" class="btn-save-mei btn btn-primary ml-1"
                @click="saveToMEI">Apply To MEI</button>
        </div>
        <div class="card-body container">
            <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5">
                <li class="row mb-1" v-for="item in rhythmPatternData">
                    <div class="col col-sm-2 card-text" style="text-align: right">
                        <p class="card-text">{{ item.on_display }}</p>
                    </div>
                    <div class="col col-sm-10 card-text"> <input class="w-100 p-1" type="text" :value="item.value"
                            @change="getMusicalRhythm" :placeholder="item.default" /> </div>
                </li>
                <div class="row" id="pattern-canvas"></div>
            </div>
        </div>
        <MusicalScore id="RhythmPatternForm" :vT="vT" />
    </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue';
import MusicalScore from './MusicalScore.vue';
import * as music21 from 'music21j';

export default {
    components: {
        MusicalScore
    },
    props: ['MEIData', 'vT'],
    setup(props) {
        const rhythmPatternData = ref([
            { name: 'rhythm pattern', tag: './/mei:supplied[@type="rhythm pattern"]', value: '', on_display: 'Rhythm Pattern', default: '' },
        ]);

        onMounted(() => {
            getInfoFromMEI();
        });

        const saveToMEI = () => {
            let rhythmPNode = getXpathNode(props.MEIData, './/mei:music//mei:section//mei:supplied[@type="rhythm pattern"]');
            if (rhythmPNode) {
                rhythmPNode.remove();
            };

            rhythmPNode = document.createElementNS('http://www.music-encoding.org/ns/mei', 'supplied');
            rhythmPNode.setAttribute('type', 'rhythm pattern');
            getXpathNode(props.MEIData, './/mei:music//mei:section').insertAdjacentElement("afterbegin", rhythmPNode);

            let pattern = rhythmPatternData.value[0].value.split(']');
            for (let i in pattern) {
                let pt = pattern[i].split('[');
                for (let j in pt) {
                    if (/\d/.test(pt[j])) {
                        let pt_s = pt[j].toString().split(" ").slice(1);

                        let bT = rhythmPNode;
                        if (pt[j][0] == 'b') {
                            bT = document.createElementNS('http://www.music-encoding.org/ns/mei', 'beam');
                            if (pt[j][1] != ' ') { bT.setAttribute('tuplet', pt[j][1]); }
                            rhythmPNode.append(bT);
                        };

                        for (let n in pt_s) {
                            if (/\d/.test(pt_s[n])) {
                                let note = document.createElementNS('http://www.music-encoding.org/ns/mei', 'note');
                                if (pt_s[n].includes('.')) {
                                    let dots = pt_s[n].toString().split(".");
                                    note.setAttribute('dur', parseInt(dots[0]));
                                    note.setAttribute('dots', dots.length - 1);
                                } else {
                                    note.setAttribute('dur', parseInt(pt_s[n]));
                                }
                                bT.append(note);
                            }
                        };
                    }
                }
            }

            console.log(getXpathNode(props.MEIData, './/mei:music//mei:section//mei:supplied[@type="rhythm pattern"]'));
        };

        const getMusicalRhythm = (event) => {
            
            if (event) {
                rhythmPatternData.value[0].value = event.target.value;
            }

            let streamM = new music21.stream.Stream();

            let pattern = rhythmPatternData.value[0].value.split(']');
            for (let i in pattern) {
                let pt = pattern[i].split('[');
                for (let j in pt) {
                    if (/\d/.test(pt[j])) {
                        let pt_s = pt[j].toString().split(" ").slice(1);
                        for (let k in pt_s) {
                            let duration = 4 / parseFloat(pt_s[k]);
                            if (pt_s[k].includes('.')) {
                                let dots = pt_s[k].toString().split(".");
                                duration = parseFloat(dots[0]) / 4;
                                let tempD = duration;
                                for (let _ in dots.slice(1)) {
                                    duration += tempD / 2;
                                    tempD /= 2;
                                }
                            }

                            let tuplet = 1;
                            if (pt[j][0] == 'b' && pt[j][1] != ' ') {
                                tuplet = parseInt(pt[j][1]);
                                duration *= (tuplet - 1) / tuplet;
                            }

                            if (duration) {
                                const n = new music21.note.Note('B', duration);
                                if ((pt[j][0] == 'b' && pt[j][1] != ' ' && duration < ((tuplet - 1) / tuplet)) || (pt[j][0] == 'b' && pt[j][1] == ' ')) {
                                    if (k == 0) { n.beams.append('start'); }
                                    else if (k == pt_s.length - 1) { n.beams.append('stop'); }
                                    else { n.beams.append('continue'); }
                                };
                                streamM.append(n);
                            }
                        }
                    }
                }
            }

            streamM.renderOptions.scaleFactor = { x: .7, y: .7 };
            streamM.renderOptions.staffLines = 1;
            streamM.renderOptions.displayClef = false;
            streamM.renderOptions.rightBarline = "none";

            let div = document.getElementById('pattern-canvas');
            if (div.children[0]) {
                div.removeChild(div.children[0]);
            };
            streamM.appendNewDOM(div);
        };

        const getXpathNode = (nodeP, xpath) => {
            const result = nodeP.evaluate(xpath, nodeP, prefix => prefix === 'mei' ? 'http://www.music-encoding.org/ns/mei' : null, XPathResult.ANY_TYPE, null);
            return result.iterateNext();
        }

        const processNoteTag = (tag) => {
            if (tag.tagName == 'note') {
                let tagP = ' ' + tag.getAttribute('dur');
                if (tag.getAttribute('dots')) {
                    tagP += '.'.repeat(parseInt(tag.getAttribute('dots')));
                }
                return tagP;
            }
            return '';
        }

        const getInfoFromMEI = () => {

            for (let i in rhythmPatternData.value) {
                let item = rhythmPatternData.value[i];
                let node = getXpathNode(props.MEIData, item.tag);

                if (node) {

                    let tempRhythmStr = '';
                    for (let i in node.children) {
                        let rhythm = node.children[i];
                        if (rhythm.tagName == 'beam') {
                            tempRhythmStr += ' [b';
                            if (rhythm.getAttribute('tuplet')) {
                                tempRhythmStr += rhythm.getAttribute('tuplet');
                            }
                            for (let r2 in rhythm.children) {
                                tempRhythmStr += processNoteTag(rhythm.children[r2]);
                            }
                            tempRhythmStr += ']';
                        } else if (rhythm.tagName == 'note') {
                            tempRhythmStr += processNoteTag(rhythm);
                        }
                        rhythmPatternData.value[0].value = tempRhythmStr.slice(1);
                    }
                } else {
                    /* Try to Find An Algorithm that gets the rhythmic pattern ? */
                }

                getMusicalRhythm()
            }
        };

        return {
            rhythmPatternData,
            getXpathNode,
            getInfoFromMEI,
            saveToMEI,
            processNoteTag,
            getMusicalRhythm
        };
    },
};
</script>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}

.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
