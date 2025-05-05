<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Ambitus, Rhythm Pattern and Segmentation Form</h4>
            <!--<button href="#" class="btn-save-mei btn btn-primary ml-1" @click="saveToMEI"
                title="Apply Information To MEI File" data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip"
                data-bs-placement="bottom" data-bs-html="true">Apply To MEI</button>-->
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
                </li>
            </div>
        </div>
        <Teleport to="body">
            <modal :show="showModal" @close="showModal = false">
                <template #header>
                    <h3>Saved Ambitus, Rhythm Pattern and Segmentation to MEI File</h3>
                </template>
                <template #body>
                    <pre class="w-100" id="MEI-Modal-TitleStmt">{{ TitleStmtOntMEI }}</pre>
                </template>
            </modal>
        </Teleport>
    </div>
</template>

<script type="module">
import Modal from '../Modal.vue';
import { Tooltip } from 'bootstrap';

export default {
    inject: ['getXpathNode', 'prettifyXml', 'createNodesMethods', 'updateNodesMethods', 'getAutomaticAmbitus', 'getAutomaticRhythmPattern', 'getAutomaticSegmentation'],
    components: {
        Tooltip,
        Modal
    },
    props: ['MEIFiles', 'vT', 'export'],
    emits: ["saveFinished"],
    data() {
        return {
            automaticInfoData: [
                { name: 'ambitus', on_display: 'Ambitus', function: this.calculateAmbitus, tooltip: 'Calculates Lowest and Highest Notes of Score in midi pitch' },
                { name: 'rhythm pattern', on_display: 'Rhythm Pattern', function: this.calculateRhythmPattern, tooltip: `<pre>Calculates the Rhythm Pattern string.\n rhythm_pattern (str): Rhythm Pattern\n- the string should contain the number of each note of the rhythm, i.e., 8 for 8th notes, 4 for quarter notes, etc.\n- each number should be separated by a space\n- if the notes should be beamed, they should be surrounded by brackets with a b just next to the first bracket, i.e., [b 8 8]\n- Example of a rhythm_pattern: '[b 8 8] 4 [b 8 16 16]'</pre>` },
                { name: 'phrases', on_display: 'Phrases', function: this.calculateSegmentation, tooltip: 'Calculates Segmentation of song (i.e., beginnings and endings for each phrase in a song).' },
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
        },
        calculateRhythmPattern() {
            console.log('RHYTHM');
            this.MEIFiles.forEach((file) => {
                this.getAutomaticRhythmPattern(file['vT'], file['xmlDoc']);
            });
        },
        calculateSegmentation() {
            console.log('PHRASE');
            this.MEIFiles.forEach((file) => {
                this.getAutomaticSegmentation(file['vT'], file['xmlDoc']);
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