<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Structural Patterns</h4> <button href="#" class="btn-save-mei btn btn-primary ml-1"
                @click="saveToMEI" title="Apply Information To MEI File" data-bs-customClass="custom-tooltip"
                data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true">Apply To MEI</button>
        </div>
        <div class="card-body container">
            <div id="buttons-open-forms" class="row mb-3">
                <div class="col col-sm-3 card-text card card-body m-1" v-for="item in structuralPatternsData">
                    <div class="row align-items-center p-1">
                        <p class="col col-sm-7 mb-0" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                            data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{ item.on_display
                            }}
                        </p>
                        <button class="col col-sm-5" @click="item.show_colapsible = !item.show_colapsible">OPEN</button>
                    </div>
                </div>
            </div>
            <div id="pattern-editor-forms" class="row mb-3">
                <div class="card card-body col col-sm-12 p-4 pt-0 pb-0" v-show="item.show_colapsible"
                    v-for="item in structuralPatternsData">
                    <div class="row justify-content-center align-items-center mb-1 pt-2">
                        <div class="col col-sm-11">{{ item.on_display }}</div>
                        <button class="col col-sm-1">AUTO</button>
                    </div>
                    <div v-if="item.name == 'pitch pattern'" class="row row-cols-12 p-1 mb-1">
                        <div v-for="[key, pc] in Object.entries(item.value)" class="col col-sm-1">
                            <vue3-slider class="row p-0" color="#FFBF65" track-color="#0065A2" orientation="vertical"
                                :name="'pc-' + key" v-model="item.value[key]" width="5em" height="2em"
                                :max="numberNotes" />
                            <em class="row p-0 label-input-histogram"><small :for="'pc-' + key">{{ pc }}</small></em>
                            <strong class="row p-0"><small :for="'pc-' + key">{{ key }}</small></strong>
                        </div>
                    </div>
                    <div v-else-if="item.name == 'interval pattern'" class="row p-1 mb-1">
                        <div v-for="[key, pc] in Object.entries(item.value)" class="col col-25 ">
                            <vue3-slider class="row p-0" color="#FFBF65" track-color="#0065A2" orientation="vertical"
                                :name="'pc-' + key" v-model="item.value[key]" width="5em" :max="numberNotes" />
                            <em class="row p-0 label-input-histogram"><small :for="'pc-' + key">{{ pc }}</small></em>
                            <strong class="row p-0"><small :for="'pc-' + key">{{ key - 12 }}</small></strong>
                        </div>
                    </div>
                    <div v-else class="row p-1 mb-1">
                        TODO
                    </div>
                </div>
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

import slider from "vue3-slider";

import Modal from '../Modal.vue';
import MusicalScore from '../MusicalScore.vue';

import { Tooltip } from 'bootstrap';

import * as music21 from 'music21j';

export default {
    inject: ['getXpathNode', 'prettifyXml', 'createNodesMethods', 'updateNodesMethods', 'getAutomaticStructuralPattern_P', 'getAutomaticStructuralPattern_I', 'getAutomaticStructuralPattern_R',],
    components: {
        Tooltip,
        Modal,
        MusicalScore,
        "vue3-slider": slider
    },
    props: ['MEIData', 'vT', 'export'],
    emits: ["saveFinished"],
    data() {
        return {
            structuralPatternsData: [
                { name: 'pitch pattern', tag: './/mei:supplied[@type="pitch pattern"]', value: Array(12).fill(0), on_display: 'Pitch Pattern', show_colapsible: false, default: Array(12).fill(0), tooltip: `<pre></pre>` },
                { name: 'interval pattern', tag: './/mei:supplied[@type="interval pattern"]', value: '', on_display: 'Intervallic Pattern', show_colapsible: false, default: '', tooltip: `<pre></pre>` },
                { name: 'rhythm pattern', tag: './/mei:supplied[@type="rhythm pattern"]', value: '', on_display: 'Rhythm Pattern', show_colapsible: false, default: '', tooltip: `<pre></pre>` },
            ],
            numberNotes: 100,
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
                    this.numberNotes = this.structuralPatternsData[0].value.reduce((partialSum, a) => partialSum + a, 0);
                }
            });
        }
    },
};
</script>

<style scoped>
.pattern-editor-forms>* {
    grid-template-columns: repeat(25, 1fr);
}

.label-input-histogram {
    background-color: lightgray;
}
</style>
