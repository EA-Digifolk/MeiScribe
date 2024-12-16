<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Phrases and Segmentation</h4> <button href="#" class="btn-save-mei btn btn-primary ml-1"
                @click="saveToMEI" title="Apply Information To MEI File" data-bs-customClass="custom-tooltip"
                data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true">Apply To MEI</button>
        </div>
        <div class="card-body container">
            <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5">
                <div class="w-100" @click="cleanPaintSVG"><button class="mb-3" @click="addPhrase"
                        title="Add a New Phrase" data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip"
                        data-bs-placement="bottom" data-bs-html="true">Add</button></div>
                <div v-for="item in phraseSegmentData[0].value" class="row phrase-sel">
                    <div class="col col-xs-1" title="Number of the Phrase (min: 1)" data-bs-customClass="custom-tooltip"
                        data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true">N</div>
                    <input :id="'note-' + item.n" class="col col-xs-1" type="number" :value="item.n"
                        @change="chooseN"></input>
                    <div class="col col-xs-2" title="ID of Phrase's Starting Note" data-bs-customClass="custom-tooltip"
                        data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true">Start ID</div>
                    <input :id="'start-id-' + item.n" class="col col-xs-2" type="search" list="noteIDS"
                        :value="item.startid" @click="paintNoteSVG" @change="chooseNote"></input>
                    <div class="col col-xs-1" title="ID of Phrase's Ending Note" data-bs-customClass="custom-tooltip"
                        data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true">End ID</div>
                    <input :id="'end-id-' + item.n" class="col col-xs-2" type="search" list="noteIDS"
                        :value="item.endid" @click="paintNoteSVG" @change="chooseNote"></input>
                    <div class="col col-xs-1" title="Type of Phrase (A/B, etc)" data-bs-customClass="custom-tooltip"
                        data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true">Type</div>
                    <input :id="'type-' + item.n" class="col col-xs-2" type="search" list="typePhrases"
                        :value="item.type" @change="chooseType"></input>
                    <a @click="deletePhrase(item.n)" class="col col-xs-1 btn btn-danger btn-sm del-btn" type="button"
                        title="Delete Phrase" data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip"
                        data-bs-placement="bottom" data-bs-html="true">
                        <svg-icon :path="thrashIcon" size="20" viewbox="0 0 28 28" style="color: white"></svg-icon>
                    </a>
                    <datalist id="noteIDS">
                        <option v-for="itemX in noteIDs" :value="itemX"></option>
                    </datalist>
                    <datalist id="typePhrases">
                        <option v-for="itemX in ['A', 'A1', 'A2', 'B', 'B1', 'B2', 'C', 'CODA', 'INTRO']"
                            :value="itemX"></option>
                    </datalist>
                </div>
            </div>
        </div>
        <MusicalScore id="phraseForm" :vT="vT" showIds="true"/>
        <Teleport to="body">
            <modal :show="showModal" @close="showModal = false">
                <template #header>
                    <h3>Saved Phrase Structure to MEI File</h3>
                </template>
                <template #body>
                    <pre class="w-100" id="MEI-Modal-Segmentation">{{ SegmentationOntMEI }}</pre>
                </template>
            </modal>
        </Teleport>
    </div>
</template>

<script type="module">

import { Tooltip } from 'bootstrap';

import Modal from './Modal.vue';
import MusicalScore from './MusicalScore.vue';

export default {
    inject: ['getXpathNode', 'prettifyXml'],
    components: {
        MusicalScore,
        Tooltip,
        Modal
    },
    props: ['MEIData', 'vT', 'export'],
    emits: ["saveFinished"],
    data() {
        return {
            phraseSegmentData: [
                { name: 'phrases', tag: './/mei:music//mei:section//mei:supplied[@type="phrases"]', value: [], on_display: 'Phrases' },
            ],
            noteIDs: [],
            showModal: false,
            SegmentationOntMEI: '',
            thrashIcon: "M 10 2 L 9 3 L 5 3 C 4.4 3 4 3.4 4 4 C 4 4.6 4.4 5 5 5 L 7 5 L 17 5 L 19 5 C 19.6 5 20 4.6 20 4 C 20 3.4 19.6 3 19 3 L 15 3 L 14 2 L 10 2 z M 5 7 L 5 20 C 5 21.1 5.9 22 7 22 L 17 22 C 18.1 22 19 21.1 19 20 L 19 7 L 5 7 z M 9 9 C 9.6 9 10 9.4 10 10 L 10 19 C 10 19.6 9.6 20 9 20 C 8.4 20 8 19.6 8 19 L 8 10 C 8 9.4 8.4 9 9 9 z M 15 9 C 15.6 9 16 9.4 16 10 L 16 19 C 16 19.6 15.6 20 15 20 C 14.4 20 14 19.6 14 19 L 14 10 C 14 9.4 14.4 9 15 9 z"
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
    watch: {
        export: function (newVal, oldVal) {
            if (newVal != oldVal) {
                this.saveToMEI(false);
            }
        }
    },
    methods: {
        saveToMEI(openModal = true) {
            let phraseNode = this.getXpathNode(this.MEIData, './/mei:music//mei:section//mei:supplied[@type="phrases"]');
            if (phraseNode) {
                phraseNode.remove();
            };

            phraseNode = document.createElementNS('http://www.music-encoding.org/ns/mei', 'supplied');
            phraseNode.setAttribute('type', 'phrases');

            let rhythmicSupplied = this.getXpathNode(this.MEIData, './/mei:music//mei:section//mei:supplied[@type="rhythm pattern"]');
            if (rhythmicSupplied) {
                rhythmicSupplied.insertAdjacentElement("afterend", phraseNode);
            } else {
                this.getXpathNode(this.MEIData, './/mei:music//mei:section').insertAdjacentElement("afterbegin", phraseNode);
            }

            let phrases = this.phraseSegmentData[0].value;
            for (let ph in phrases) {
                let phEl = document.createElementNS('http://www.music-encoding.org/ns/mei', 'phrase');
                phEl.setAttribute('n', phrases[ph].n);
                phEl.setAttribute('startid', '#' + phrases[ph].startid);
                phEl.setAttribute('endid', '#' + phrases[ph].endid);
                phEl.setAttribute('type', phrases[ph].type);
                phraseNode.append(phEl);
            }

            this.SegmentationOntMEI = this.prettifyXml(new XMLSerializer().serializeToString(this.getXpathNode(this.MEIData, './/mei:music//mei:section//mei:supplied[@type="phrases"]')));
            
            if (openModal) {
                this.showModal = !this.showModal;
            } else {
                this.$emit("saveFinished", "SegmentationForm");
            }
        },
        getInfoFromMEI() {
            this.noteIDS = this.vT.getDescriptiveFeatures()['pitchesIds'].flat().flat();
            this.phraseSegmentData.forEach(item => {
                let node = this.getXpathNode(this.MEIData, item.tag);
                if (node) {
                    for (let i in node.children) {
                        let phraseN = node.children[i];
                        if (phraseN.tagName == 'phrase') {
                            item.value.push({ 'n': phraseN.getAttribute('n'), 'startid': phraseN.getAttribute('startid').replace('#', ''), 'endid': phraseN.getAttribute('endid').replace('#', ''), 'type': phraseN.getAttribute('type') })
                        }
                    };
                } else {
                    this.addPhrase();
                }
            });
        },
        deletePhrase(n) {
            this.phraseSegmentData[0].value = this.phraseSegmentData[0].value.filter(function (el) { return el.n != n; });
        },
        addPhrase() {
            let lastPhrase = this.phraseSegmentData[0].value[this.phraseSegmentData[0].value.length - 1];
            if (lastPhrase == null) {
                lastPhrase = { 'n': 0 };
            }
            this.phraseSegmentData[0].value.push({ 'n': parseInt(lastPhrase['n']) + 1, 'startid': this.noteIDS[0], 'endid': this.noteIDS[this.noteIDS.length - 1], 'type': 'A' });
        },
        paintNoteSVG(event) {
            let svgClass = event.target.id.includes('start') ? "select-start" : "select-end";
            let notesOnSVG = document.getElementsByClassName('note');
            Array.from(notesOnSVG).forEach((e, _) => {
                if (e.id === event.target.value && !e.classList.contains('bounding-box')) {
                    e.classList.add(svgClass);
                } else {
                    e.classList.remove(svgClass);
                }
            });
        },
        cleanPaintSVG() {
            let notesOnSVG = document.getElementsByClassName('note');
            Array.from(notesOnSVG).forEach((e, _) => {
                e.classList.remove("select-start");
                e.classList.remove("select-end");
            });
        },
        chooseNote(event) {
            if (event.target.id.includes('start')) {
                this.phraseSegmentData[0].value.filter(function (el) { return el.n == event.target.id.replace('start-id-', ''); })[0].startid = event.target.value;
            } else {
                this.phraseSegmentData[0].value.filter(function (el) { return el.n == event.target.id.replace('end-id-', ''); })[0].endid = event.target.value;
            };

            this.paintNoteSVG(event);
        },
        chooseN(event) {
            this.phraseSegmentData[0].value.filter(function (el) { return el.n == event.target.id.replace('note-', ''); })[0].n = parseInt(event.target.value);
        },
        chooseType(event) {
            this.phraseSegmentData[0].value.filter(function (el) { return el.n == event.target.id.replace('type-', ''); })[0].type = event.target.value;
        }
    },
};
</script>

<style scoped>
.phrase-sel {
    align-items: center;
    font-size: small;
    margin-bottom: .1em;
    border: 1px solid grey;
}

.del-btn {
    margin: .1em .5em .1em 1.5em;
    padding: .2em;
    /*max-width: 5% !important;*/
}

option:hover {
    background-color: red;
}

#MEI-Modal-Segmentation {
    max-height: 80% !important;
}
</style>
