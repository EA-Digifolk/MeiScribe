<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Rhythmic Patterns</h4> <button href="#" class="btn-save-mei btn btn-primary ml-1"
                @click="saveToMEI" title="Apply Information To MEI File" data-bs-customClass="custom-tooltip"
                data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true">Apply To MEI</button>
        </div>
        <div class="card-body container">
            <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5">
                <li class="row mb-1" v-for="item in rhythmPatternData">
                    <div class="col col-sm-2 card-text" style="text-align: right">
                        <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                            data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{ item.on_display }}
                        </p>
                    </div>
                    <div class="col col-sm-10 card-text"> <input class="w-100 p-1" type="text" :value="item.value"
                            @change="getMusicalRhythm" :placeholder="item.default" /> </div>
                </li>
                <div class="row" id="pattern-canvas"></div>
            </div>
        </div>
        <MusicalScore id="RhythmPatternForm" :vT="vT" />
        <Teleport to="body">
            <modal :show="showModal" @close="showModal = false">
                <template #header>
                    <h3>Saved Rhythm Pattern to MEI File</h3>
                </template>
                <template #body>
                    <pre class="w-100" id="MEI-Modal-TitleStmt">{{ RhythmPatternOntMEI }}</pre>
                </template>
            </modal>
        </Teleport>
    </div>
</template>

<script type="module">
import Modal from './Modal.vue';
import { Tooltip } from 'bootstrap';
import MusicalScore from './MusicalScore.vue';
import * as music21 from 'music21j';

export default {
    inject: ['getXpathNode', 'prettifyXml'],
    components: {
        Tooltip,
        Modal,
        MusicalScore
    },
    props: ['MEIData', 'vT'],
    data() {
        return {
            rhythmPatternData: [
                { name: 'rhythm pattern', tag: './/mei:supplied[@type="rhythm pattern"]', value: '', on_display: 'Rhythm Pattern', default: '', tooltip: `<pre>rhythm_pattern (str): Rhythm Pattern\n- the string should contain the number of each note of the rhythm, i.e., 8 for 8th notes, 4 for quarter notes, etc.\n- each number should be separated by a space\n- if the notes should be beamed, they should be surrounded by brackets with a b just next to the first bracket, i.e., [b 8 8]\n- Example of a rhythm_pattern: '[b 8 8] 4 [b 8 16 16]'</pre>` },
            ],
            showModal: false,
            RhythmPatternOntMEI: ''
        }
    },
    mounted() {
        this.getInfoFromMEI();
        const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            new Tooltip(tooltipTriggerEl, {
                customClass: 'custom-tooltip',
                animated: 'fade',
                placement: 'bottom',
                trigger: 'hover'
            });
        });
    },
    methods: {
        saveToMEI() {
            let rhythmPNode = this.getXpathNode(this.MEIData, './/mei:music//mei:section//mei:supplied[@type="rhythm pattern"]');
            if (rhythmPNode) {
                rhythmPNode.remove();
            };

            rhythmPNode = document.createElementNS('http://www.music-encoding.org/ns/mei', 'supplied');
            rhythmPNode.setAttribute('type', 'rhythm pattern');
            this.getXpathNode(this.MEIData, './/mei:music//mei:section').insertAdjacentElement("afterbegin", rhythmPNode);

            let pattern = this.rhythmPatternData[0].value.split(']');
            for (let i in pattern) {
                let pt = pattern[i].split('[');
                for (let j in pt) {
                    if (/\d/.test(pt[j])) {
                        let pt_s = pt[j].toString().split(" ");
                        if (pt_s[0] == " ") {
                            pt_s = pt_s.slice(1);
                        };

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
            };

            this.RhythmPatternOntMEI = this.prettifyXml(new XMLSerializer().serializeToString(this.getXpathNode(this.MEIData, './/mei:music//mei:section//mei:supplied[@type="rhythm pattern"]')));
            this.showModal = true;
        },
        getMusicalRhythm(event) {

            if (event) {
                this.rhythmPatternData[0].value = event.target.value;
            }

            let streamM = new music21.stream.Stream();

            let pattern = this.rhythmPatternData[0].value.split(']');
            for (let i in pattern) {
                let pt = pattern[i].split('[');

                for (let j in pt) {
                    if (/\d/.test(pt[j])) {
                        let pt_s = pt[j].toString().split(" ");
                        if (pt_s[0] == " ") {
                            pt_s = pt_s.slice(1);
                        };

                        for (let k in pt_s) {
                            let duration = 4 / parseFloat(pt_s[k]);
                            if (pt_s[k].includes('.')) {
                                let dots = pt_s[k].toString().split(".");
                                duration = 4 / parseFloat(dots[0]);
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
                                if ((pt[j][0] == 'b' && pt[j][1] != ' ' && duration < ((tuplet - 1) / tuplet)) || (pt[j][0] == 'b' && pt[j][1] == ' ' && duration < 1)) {
                                    try {
                                        if (k == 0) { n.beams.append('start'); }
                                        else if (k == pt_s.length - 1) { n.beams.append('stop'); }
                                        else { n.beams.append('continue'); }
                                    } catch (err) {
                                        console.log('Beamming is not possible!');

                                    }
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
        },
        processNoteTag(tag) {
            if (tag.tagName == 'note') {
                let tagP = ' ' + tag.getAttribute('dur');
                if (tag.getAttribute('dots')) {
                    tagP += '.'.repeat(parseInt(tag.getAttribute('dots')));
                }
                return tagP;
            }
            return '';
        },
        getInfoFromMEI() {
            this.rhythmPatternData.forEach(item => {
                let node = this.getXpathNode(this.MEIData, item.tag);
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
                                tempRhythmStr += this.processNoteTag(rhythm.children[r2]);
                            }
                            tempRhythmStr += ']';
                        } else if (rhythm.tagName == 'note') {
                            tempRhythmStr += this.processNoteTag(rhythm);
                        }
                        this.rhythmPatternData[0].value = tempRhythmStr.slice(1);
                    }
                } else {
                    /* Try to Find An Algorithm that gets the rhythmic pattern ? */
                }

                this.getMusicalRhythm()
            });
        }
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
