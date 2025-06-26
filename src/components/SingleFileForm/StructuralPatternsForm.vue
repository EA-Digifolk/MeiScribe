<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Structural Patterns</h4> <button href="#" class="btn-save-mei btn btn-primary ml-1"
                @click="saveToMEI" title="Apply Information To MEI File" data-bs-customClass="custom-tooltip"
                data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true">Apply To MEI</button>
        </div>
        <div class="card-body container">
            <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5">
                <li class="row mb-1" v-for="item in structuralPatternsData">
                    <div class="col col-sm-2 card-text" style="text-align: right">
                        <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                            data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{ item.on_display }}
                        </p>
                    </div>
                    <div class="col col-sm-10 card-text p-0 m-0">
                        <div v-if="item.name == 'pitch pattern'" class="row p-1 mb-1">
                            <div v-for="[key, pc] in Object.entries(item.value)" class="col col-sm-1">
                                <div class="row p-0 label-input-histogram">
                                    <label class="col-sm-5 p-0" :for="'pc-' + key">{{ key }}</label>
                                    <input class="col-sm-7 p-0" type="number" :value="pc" :name="'pc-' + key"/>
                                </div>
                            </div>
                        </div>
                        <div v-else-if="item.name == 'interval pattern'" class="row p-1 mb-1">
                            <div v-for="[key, pc] in Object.entries(item.value)" class="col col-sm-1">
                                <div class="row p-0 label-input-histogram">
                                    <label class="col-sm-5 p-0" :for="'pc-' + key">{{ key-12 }}</label>
                                    <input class="col-sm-7 p-0" type="number" :value="pc" :name="'pc-' + key"/>
                                </div>
                            </div>
                        </div>
                        <input v-else class="w-100 p-1" type="text" :value="item.value" :placeholder="item.default" />
                    </div>
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
                    <pre class="w-100" id="MEI-Modal-TitleStmt">{{ StructuralPatternsOntMEI }}</pre>
                </template>
            </modal>
        </Teleport>
    </div>
</template>

<script type="module">

import Modal from '../Modal.vue';
import MusicalScore from '../MusicalScore.vue';

import { Tooltip } from 'bootstrap';

import * as music21 from 'music21j';

export default {
    inject: ['getXpathNode', 'prettifyXml', 'createNodesMethods', 'updateNodesMethods', 'getAutomaticStructuralPattern_P', 'getAutomaticStructuralPattern_I', 'getAutomaticStructuralPattern_R',],
    components: {
        Tooltip,
        Modal,
        MusicalScore
    },
    props: ['MEIData', 'vT', 'export'],
    emits: ["saveFinished"],
    data() {
        return {
            structuralPatternsData: [
                { name: 'pitch pattern', tag: './/mei:supplied[@type="pitch pattern"]', value: Array(12).fill(0), on_display: 'Pitch Pattern', default: Array(12).fill(0), tooltip: `<pre></pre>` },
                { name: 'interval pattern', tag: './/mei:supplied[@type="interval pattern"]', value: '', on_display: 'Intervallic Pattern', default: '', tooltip: `<pre></pre>` },
                { name: 'rhythm pattern', tag: './/mei:supplied[@type="rhythm pattern"]', value: '', on_display: 'Rhythm Pattern', default: '', tooltip: `<pre></pre>` },
            ],
            showModal: false,
            StructuralPatternsOntMEI: ''
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
            let rhythmPNode = this.getXpathNode(this.MEIData, './/mei:music//mei:section//mei:supplied[@type="rhythm pattern"]');
            if (!rhythmPNode) {
                this.createNodesMethods(this.MEIData, 'rhythmPattern');
            }
            this.updateNodesMethods(this.MEIData, this.structuralPatternsData, 'rhythmPattern');

            this.StructuralPatternsOntMEI = this.prettifyXml(new XMLSerializer().serializeToString(this.getXpathNode(this.MEIData, './/mei:music//mei:section//mei:supplied[@type="rhythm pattern"]')));

            if (openModal) {
                this.showModal = !this.showModal;
            } else {
                this.$emit("saveFinished", "RhythmPatternForm");
            }
        },
        getInfoFromMEI() {
            this.structuralPatternsData.forEach(item => {
                let node = this.getXpathNode(this.MEIData, item.tag);
                if (node) {
                } else {
                    this.structuralPatternsData[0].value = this.getAutomaticStructuralPattern_P(this.vT);
                    this.structuralPatternsData[1].value = this.getAutomaticStructuralPattern_I(this.vT);
                    this.structuralPatternsData[2].value = this.getAutomaticStructuralPattern_R(this.vT);
                }
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

.label-input-histogram {
    background-color: gray;
}

.label-input-histogram > input {
    border-radius: 0;
}
</style>
