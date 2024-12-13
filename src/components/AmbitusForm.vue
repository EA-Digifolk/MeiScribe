<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Ambitus (Pitch Range) Form</h4> <button href="#" class="btn-save-mei btn btn-primary ml-1"
                @click="saveToMEI" title="Apply Information To MEI File" data-bs-customClass="custom-tooltip"
                data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true">Apply To MEI</button>
        </div>
        <div class="card-body container">
            <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5 row w-100">
                <li class="row mb-1 w-50" v-for="item in ambitusData">
                    <div class="col col-sm-5 card-text" style="text-align: right">
                        <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                            data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{ item.on_display }}
                        </p>
                    </div>
                    <div class="col col-sm-7 card-text"> <input class="w-100 p-1" type="number" v-model="item.value"
                            :placeholder="item.default" /> </div>
                </li>
            </div>
        </div>
        <MusicalScore id="AmbitusForm" :vT="vT" />
        <Teleport to="body">
            <modal :show="showModal" @close="showModal = false">
                <template #header>
                    <h3>Saved Ambitus to MEI File</h3>
                </template>
                <template #body>
                    <pre class="w-100" id="MEI-Modal-TitleStmt">{{ AmbitusOntMEI }}</pre>
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
    props: ['MEIData', 'vT', 'export'],
    emits: ["saveFinished"],
    data() {
        return {
            ambitusData: [
                { name: 'lowest', tag: './/mei:ambNote[@type="lowest"]', value: 0, on_display: 'Lowest Pitch', default: 0, tooltip: 'Lowest Note of Score in midi pitch' },
                { name: 'highest', tag: './/mei:ambNote[@type="highest"]', value: 128, on_display: 'Highest Pitch', default: 128, tooltip: 'Highest Note of Score in midi pitch' },
            ],
            showModal: false,
            AmbitusOntMEI: ''
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
            let ambitusNode = this.getXpathNode(this.MEIData, './/mei:ambitus');
            if (!ambitusNode) {
                let node = this.getXpathNode(this.MEIData, './/mei:scoreDef');

                const entriesN = ['ambitus'];
                for (let key in entriesN) {
                    let temp_node = document.createElementNS('http://www.music-encoding.org/ns/mei', entriesN[key]);
                    node.append(temp_node);
                    node = temp_node;
                }
                ambitusNode = node;
            }

            this.ambitusData.forEach(item => {
                let node = this.getXpathNode(this.MEIData, item.tag);

                if (!node) {
                    node = document.createElementNS('http://www.music-encoding.org/ns/mei', 'ambNote');
                    node.setAttribute('type', item.name);
                    ambitusNode.append(node);
                }

                if (node) {
                    // midi pitch to pname and oct
                    const n = new music21.pitch.Pitch(item.value);
                    node.setAttribute('pname', n.name.toLowerCase().replace(/\s+/g, ' ').trim());
                    node.setAttribute('oct', n.octave);
                }
            });

            this.AmbitusOntMEI = this.prettifyXml(new XMLSerializer().serializeToString(this.getXpathNode(this.MEIData, './/mei:ambitus')));
            
            if (openModal) {
                this.showModal = !this.showModal;
            } else {
                this.$emit("saveFinished", "AmbitusForm");
            }
        },
        getInfoFromMEI() {
            this.ambitusData.forEach(item => {
                let node = this.getXpathNode(this.MEIData, item.tag);
                if (node) {
                    const n = new music21.pitch.Pitch(node.getAttribute('pname') + node.getAttribute('oct'));
                    item.value = n.ps;
                } else {
                    // calculate ambitus from score
                    let midiPitches = this.vT.getDescriptiveFeatures()['pitchesIds'].map((element, index) => {
                        return this.vT.getMIDIValuesForElement(element[0])['pitch'];
                    });
                    if (item.name === 'highest') {
                        item.value = Math.max.apply(null, midiPitches);
                    } else {
                        item.value = Math.min.apply(null, midiPitches);
                    }
                }
            });
        }
    },
};
</script>

<style scoped>
#MEI-Modal-Ambitus {
    max-height: 80% !important;
}
</style>
