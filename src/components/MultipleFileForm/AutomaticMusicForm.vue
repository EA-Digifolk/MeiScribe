<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Ambitus, Structural Patterns and Segmentation</h4>
        </div>
        <div class="card-body container">
            <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5">
                <li class="row mb-1" v-for="item in automaticInfoData" :key="item.name">
                    <div class="col col-sm-3 card-text" style="text-align: right">
                        <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                            data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{ item.on_display }}
                        </p>

                    </div>
                    <div class="col col-sm-9 card-text">
                        <button href="#" class="btn btn-primary ml-1 w-100" @click="item.function" :title="item.tooltip"
                            data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip" data-bs-placement="bottom"
                            data-bs-html="true">Calculate and Apply To MEI Files</button>
                    </div>
                    <Teleport to="body">
                        <modal :show="item.show_modal_on_end" @close="item.show_modal_on_end = false">
                            <template #header>{{ item.name }}</template>
                            <template #body>
                                <div class="accordion accordion-flush" :id="'accordion-' + item.name.replace(' ', '-')">
                                    <div v-for="(file, itemN) in MEIFiles" class="accordion-item"
                                        :id="'accordionItem-' + itemN">
                                        <h2 class="accordion-header">
                                            <button class="accordion-button collapsed" type="button"
                                                data-bs-toggle="collapse" :data-bs-target="'#flushM-collapse' + itemN"
                                                aria-expanded="false" :aria-controls="'flushM-collapse' + itemN">
                                                {{ itemN + ' ' + file.filename }}
                                            </button>
                                        </h2>
                                        <div :id="'flushM-collapse' + itemN" class="accordion-collapse collapse">
                                            <div class="accordion-body p-4 bg-gray-900 text-white rounded font-mono">
                                                <code>{{ getPrettified(file.xmlDoc, item.tag) }}</code>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </modal>
                    </Teleport>
                </li>
            </div>
        </div>
    </div>
</template>

<script type="module">
import Modal from '../Modal.vue';
import { Tooltip } from 'bootstrap';

export default {
    inject: ['getXpathNode', 'prettifyXml', 'createNodesMethods', 'updateNodesMethods', 'getAutomaticAmbitus',
        'getAutomaticStructuralPattern_P', 'getAutomaticStructuralPattern_I', 'getAutomaticStructuralPattern_R',
        'getAutomaticSegmentation', 'getAutomaticVocalTopics'],
    components: {
        Tooltip,
        Modal
    },
    props: ['MEIFiles', 'vT', 'export'],
    emits: ["saveFinished"],
    data() {
        return {
            automaticInfoData: [
                { name: 'ambitus', show_modal_on_end: false, tag: './/mei:ambitus', on_display: 'Ambitus', function: this.calculateAmbitus, tooltip: 'Calculates Lowest and Highest Notes of Score in midi pitch' },
                { name: 'pitch pattern', show_modal_on_end: false, tag: './/mei:supplied[@type="pitch pattern"]', on_display: 'Pitch Pattern', function: this.calculatePitchPattern, tooltip: `<pre>Calculates the Rhythm Pattern string.\n rhythm_pattern (str): Rhythm Pattern\n- the string should contain the number of each note of the rhythm, i.e., 8 for 8th notes, 4 for quarter notes, etc.\n- each number should be separated by a space\n- if the notes should be beamed, they should be surrounded by brackets with a b just next to the first bracket, i.e., [b 8 8]\n- Example of a rhythm_pattern: '[b 8 8] 4 [b 8 16 16]'</pre>` },
                { name: 'interval pattern', show_modal_on_end: false, tag: './/mei:supplied[@type="interval pattern"]', on_display: 'Intervall Pattern', function: this.calculateIntervalPattern, tooltip: `<pre>Calculates the Rhythm Pattern string.\n rhythm_pattern (str): Rhythm Pattern\n- the string should contain the number of each note of the rhythm, i.e., 8 for 8th notes, 4 for quarter notes, etc.\n- each number should be separated by a space\n- if the notes should be beamed, they should be surrounded by brackets with a b just next to the first bracket, i.e., [b 8 8]\n- Example of a rhythm_pattern: '[b 8 8] 4 [b 8 16 16]'</pre>` },
                { name: 'rhythm pattern', show_modal_on_end: false, tag: './/mei:supplied[@type="rhythm pattern"]', on_display: 'Rhythm Pattern', function: this.calculateRhythmPattern, tooltip: `<pre>Calculates the Rhythm Pattern string.\n rhythm_pattern (str): Rhythm Pattern\n- the string should contain the number of each note of the rhythm, i.e., 8 for 8th notes, 4 for quarter notes, etc.\n- each number should be separated by a space\n- if the notes should be beamed, they should be surrounded by brackets with a b just next to the first bracket, i.e., [b 8 8]\n- Example of a rhythm_pattern: '[b 8 8] 4 [b 8 16 16]'</pre>` },
                { name: 'phrases', show_modal_on_end: false, tag: './/mei:music//mei:section//mei:supplied[@type="phrases"]', on_display: 'Phrases', function: this.calculateSegmentation, tooltip: 'Calculates Segmentation of song (i.e., beginnings and endings for each phrase in a song).' },
                { name: 'vocal topics', show_modal_on_end: false, tag: './/mei:workList//mei:keywords', on_display: 'Textual Topics', function: this.calculateVocalTopics, tooltip: 'extracted topics for the song' },
            ],
            showModal: false,
            AutomaticInfoOntMEI: ''
        };
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
        getPrettified(xmlDoc, tag) {
            return this.prettifyXml(new XMLSerializer().serializeToString(this.getXpathNode(xmlDoc, tag)));
        },
        ViewMEIFiles(openModal = true) {
            if (openModal) {
                this.showModal = !this.showModal;
            } else {
                this.$emit("saveFinished", "AutomaticForm");
            }
        },
        calculateAmbitus() {
            this.MEIFiles.forEach((file) => {
                const lowAmb = this.getAutomaticAmbitus(file['vT'], true);
                const highAmb = this.getAutomaticAmbitus(file['vT'], false);
                if (!this.getXpathNode(file['xmlDoc'], './/mei:ambitus')) {
                    this.createNodesMethods(file['xmlDoc'], 'ambitus');
                }
                this.updateNodesMethods(file['xmlDoc'], [
                    { name: 'lowest', tag: './/mei:ambNote[@type="lowest"]', value: lowAmb, default: lowAmb },
                    { name: 'highest', tag: './/mei:ambNote[@type="highest"]', value: highAmb, default: highAmb },
                ], 'ambitus');
            });
            this.automaticInfoData[0].show_modal_on_end = true;
        },
        calculatePitchPattern() {
            console.log('PITCH');
            this.MEIFiles.forEach((file) => {
                let result = this.getAutomaticStructuralPattern_P(file['vT']);
                console.log(file.filename, result);
            });
        },
        calculateIntervalPattern() {
            console.log('INTERVAL');
            this.MEIFiles.forEach((file) => {
                this.getAutomaticStructuralPattern_I(file['vT'],);
            });
        },
        calculateRhythmPattern() {
            console.log('RHYTHM');
            this.MEIFiles.forEach((file) => {
                this.getAutomaticStructuralPattern_R(file['vT']);
            });
        },
        calculateSegmentation() {
            console.log('PHRASE');
            this.MEIFiles.forEach((file) => {
                const segments = this.getAutomaticSegmentation(file['vT'], file['xmlDoc']);
                let phraseNode = this.getXpathNode(file['xmlDoc'], './/mei:music//mei:section//mei:supplied[@type="phrases"]');
                if (!phraseNode) {
                    this.createNodesMethods(file['xmlDoc'], 'segmentation');
                }
                this.updateNodesMethods(file['xmlDoc'], [
                    {
                        name: 'phrases', tag: './/mei:music//mei:section//mei:supplied[@type="phrases"]', on_display: 'Phrases', automatic: true,
                        value: segments.map((item, i) => ({ 'n': i + 1, 'startid': item.startNoteID, 'endid': item.endNoteID, 'type': item.label }))
                    },
                ], 'segmentation');
            });
        },
        calculateVocalTopics() {
            console.log('VOCAL');
            this.MEIFiles.forEach((file) => {
                this.getAutomaticVocalTopics(file['vT'], file['xmlDoc']);
            });
        },
        saveToMEI(openModal = true) {

            /*
            this.MEIFiles.forEach((file) => {
                if (!this.getXpathNode(file['xmlDoc'], './/mei:titleStmt')) {
                    this.createNodesMethods(file['xmlDoc'], 'titleStmt');
                };
                this.updateNodesMethods(file['xmlDoc'], this.automaticInfoData.filter((item) => item.select === true), 'titleStmt');
            });
            */

            //this.AutomaticInfoOntMEI = this.prettifyXml(new XMLSerializer().serializeToString(this.getXpathNode(this.MEIFiles[0]['xmlDoc'], './/mei:titleStmt')));

            if (openModal) {
                this.showModal = !this.showModal;
            } else {
                this.$emit("saveFinished", "TitleForm");
            }
        },
        getInfoFromMEI() {

        },
    }
};
</script>

<style scoped>
#MEI-Modal-TitleStmt {
    max-height: 80% !important;
}

.input-text-sel {
    width: 90%;
}

.input-check-sel {
    width: 10%;
    height: 1rem;
}
</style>