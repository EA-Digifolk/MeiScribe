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
                            data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{ item.on_display }}
                        </p>
                        <button class="col col-sm-5" @click="item.show_colapsible = !item.show_colapsible">
                            {{ item.show_colapsible ? 'CLOSE' : 'OPEN' }}
                        </button>
                    </div>
                </div>
            </div>
            <div id="pattern-editor-forms" class="row mb-3">
                <div class="card card-body col col-sm-12 p-4 pt-0 pb-0" v-show="item.show_colapsible"
                    v-for="item in structuralPatternsData">
                    <div class="row justify-content-center align-items-center mb-1 pt-2">
                        <div class="col col-sm-11">{{ item.on_display }}</div>
                        <button class="col col-sm-1" @click="calculateAutomatic(item.on_display)">AUTO</button>
                    </div>
                    <div v-if="item.name == 'pitch pattern'" class="row row-cols-12 p-1 mb-1">
                        <div v-for="[key, pc] in Object.entries(item.value)" class="col col-25 col-int">
                            <vue3-slider class="row p-0" color="#FFBF65" track-color="#0065A2" orientation="vertical"
                                :name="'pc-' + key" v-model="item.value[key]" width="5em" height="2em"
                                :max="numberNotes" aria-disabled="true" />
                            <em class="row p-0 label-input-histogram"><small :for="'pc-' + key">{{ pc }}</small></em>
                            <strong class="row p-0"><small :for="'pc-' + key">{{ key }}</small></strong>
                        </div>
                    </div>
                    <div v-else-if="item.name == 'interval pattern'" class="row p-1 mb-1">
                        <div v-for="[key, pc] in Object.entries(item.value)" class="col col-25 ">
                            <vue3-slider class="row p-0" color="#FFBF65" track-color="#0065A2" orientation="vertical"
                                :name="'pc-' + key" v-model="item.value[key]" width="5em" :max="numberNotes"
                                aria-disabled="true" />
                            <em class="row p-0 label-input-histogram"><small :for="'pc-' + key">{{ pc }}</small></em>
                            <strong class="row p-0"><small :for="'pc-' + key" class="label-key">{{ key - 12
                                    }}</small></strong>
                        </div>
                    </div>
                    <div v-else class="row p-1 mb-1">
                        <span class="col col-sm-4"><span class="row pb-1"><b style="width: 80%;">Optimal Resolution:</b><i style="width: 20%;">{{ item.optimal_resolution }}</i></span></span>
                        <div class="row p-1 mb-1">
                            <div v-for="[key, bin] in Object.entries(item.value)" class="col col-25 ">
                                <vue3-slider class="row p-0" color="#FFBF65" track-color="#0065A2"
                                    orientation="vertical" :name="'bin-' + key" v-model="item.value[key]" width="5em"
                                    :max="100" aria-disabled="true" />
                                <em class="row p-0 label-input-histogram"><small :for="'bin-' + key">{{ bin
                                        }}</small></em>
                                <strong class="row p-0"><small :for="'bin-' + key">{{ key }}</small></strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <MusicalScore id="StructuralPatternForm" :vT="vT" :meiTree="MEIData" />
        <Teleport to="body">
            <modal :show="showModal" @close="showModal = false">
                <template #header>
                    <h3>Saved Rhythm Pattern to MEI File</h3>
                </template>
                <template #body>
                    <pre class="w-100" id="MEI-Modal-StructuralPatterns">{{ StructuralPatternsOntMEI }}</pre>
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

export default {
    inject: ['getXpathNode', 'prettifyXml', 'createNodesMethods', 'updateNodesMethods',
        'getAutomaticStructuralPattern_P', 'getAutomaticStructuralPattern_I', 'getAutomaticStructuralPattern_R',],
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
                { name: 'rhythm pattern', tag: './/mei:supplied[@type="rhythm pattern"]', value: '', optimal_resolution: '16th', on_display: 'Rhythm Pattern', show_colapsible: false, default: '', tooltip: `<pre></pre>` },
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

            const patternNodes_P = this.getXpathNode(this.MEIData, this.structuralPatternsData[0].tag);
            if (!patternNodes_P) {
                this.createNodesMethods(this.MEIData, 'structuralPattern');
            }
            this.updateNodesMethods(this.MEIData, this.structuralPatternsData, 'structuralPattern');

            let serializers = this.structuralPatternsData.map((item) => {
                const node = this.getXpathNode(this.MEIData, item.tag);
                return this.prettifyXml(new XMLSerializer().serializeToString(node));
            });

            this.StructuralPatternsOntMEI = serializers.join('\n');

            if (openModal) {
                this.showModal = !this.showModal;
            } else {
                this.$emit("saveFinished", "StructuralPatternForm");
            }
        },
        getInfoFromMEI() {
            this.structuralPatternsData.forEach(item => {
                let node = this.getXpathNode(this.MEIData, item.tag);
                if (node) {
                } else {
                    this.structuralPatternsData[0].value = this.getAutomaticStructuralPattern_P(this.vT);
                    this.structuralPatternsData[1].value = this.getAutomaticStructuralPattern_I(this.vT);

                    const result = this.getAutomaticStructuralPattern_R(this.vT);
                    this.structuralPatternsData[2].value = result.value;
                    this.structuralPatternsData[2].optimal_resolution = result.optimal_resolution;

                    this.numberNotes = this.structuralPatternsData[0].value.reduce((partialSum, a) => partialSum + a, 0);
                }
            });
        },
        calculateAutomatic(pattern) {
            switch (pattern) {
                case 'Pitch Pattern':
                    this.structuralPatternsData[0].value = this.getAutomaticStructuralPattern_P(this.vT);
                    break;
                case 'Intervallic Pattern':
                    this.structuralPatternsData[1].value = this.getAutomaticStructuralPattern_I(this.vT);
                    break;
                case 'Rhythm Pattern':
                default:
                    const result = this.getAutomaticStructuralPattern_R(this.vT);
                    this.structuralPatternsData[2].value = result.value;
                    this.structuralPatternsData[2].optimal_resolution = result.optimal_resolution;
                    break;
            }
            this.numberNotes = this.structuralPatternsData[0].value.reduce((partialSum, a) => partialSum + a, 0);
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

div.vue3-slider {
    pointer-events: none !important;
    justify-self: center !important;
    width: 50% !important;
}
</style>
