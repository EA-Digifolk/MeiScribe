<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Title Statement Form</h4>
            <button href="#" class="btn-save-mei btn btn-primary ml-1" @click="saveToMEI"
                title="Apply Information To MEI File" data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip"
                data-bs-placement="bottom" data-bs-html="true">Apply To MEI</button>
        </div>
        <div class="card-body container">
            <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5">
                <li class="row mb-1" v-for="item in titleStmtData" :key="item.name">
                    <div class="col col-sm-2 card-text" style="text-align: right">
                        <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                            data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{ item.on_display }}
                        </p>
                    </div>
                    <div class="col col-sm-10 card-text">
                        <input class="w-100 p-1" type="text" v-model="item.value" :placeholder="item.default" />
                    </div>
                </li>
            </div>
        </div>
        <Teleport to="body">
            <modal :show="showModal" @close="showModal = false">
                <template #header>
                    <h3>Saved Title Statement to MEI File</h3>
                </template>
                <template #body>
                    <pre class="w-100" id="MEI-Modal-TitleStmt">{{ TitleStmtOntMEI }}</pre>
                </template>
            </modal>
        </Teleport>
    </div>
</template>

<script type="module">
import { Tooltip } from 'bootstrap';

import Modal from '../Modal.vue';

export default {
    inject: ['getXpathNode', 'prettifyXml', 'createNodesMethods', 'updateNodesMethods'],
    components: {
        Tooltip,
        Modal
    },
    props: ['MEIData', 'export', 'filename'],
    emits: ["saveFinished"],
    data() {
        return {
            titleStmtData: [
                {
                    name: 'id',
                    tag: './/mei:titleStmt//mei:title[@type="main"]',
                    value: '',
                    on_display: 'ID',
                    default: 'CO-YEAR-RE-SUB-NUM',
                    tooltip: "<pre>ID should be something similar to CO-YEAR-RE-SUB-NUM, with letters standing for:</br>-CO: Country of Origin</br>-YEAR: Year of Collection/Book</br>-RE: Region/District (ex: SA = Salamanca)</br>-SUB: Sub-Region/City</br>-NUM: Number Identifier (e.g., number of song in book, number of page in book, order, etc...)<pre>"
                },
                { name: 'title', tag: './/mei:titleStmt//mei:title[@type="main"]', value: '', on_display: 'Title', default: '', tooltip: "<pre>Title</pre>" },
                { name: 'subtitle', tag: './/mei:titleStmt//mei:title[@type="subtitle"]', value: '', on_display: 'Subtitle', default: '', tooltip: "<pre>Subtitle (optional)</pre>" },
                { name: 'composer', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="composer"]', value: '', on_display: 'Composer', default: '', tooltip: "<pre>Composer (optional)</pre>" },
                { name: 'compiler', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="compiler"]', value: '', on_display: 'Compiler', default: '', tooltip: "<pre>Compiler (optional): who compiled the song in a collection</pre>" },
                { name: 'informer', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="informer"]', value: '', on_display: 'Informer', default: '', tooltip: "<pre>Informer (optional): who told/sung the song</pre>" },
                { name: 'encoder', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="encoder"]', value: '', on_display: 'Encoder', default: '', tooltip: "<pre>Encoder (optional): who encoded the song as musicXML, MEI, ABC</pre>" },
                { name: 'editor', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="editor"]', value: '', on_display: 'Editor', default: '', tooltip: "<pre>Editor (optional): who edited the song</pre>" },
                { name: 'geogName', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="informer"]//mei:geogName', value: '', on_display: 'Geography', default: '', tooltip: "<pre>Geography (optional) information if the song is traditional from a specific region</pre>" },
            ],
            showModal: false,
            TitleStmtOntMEI: ''
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
        saveToMEI(openModal = true) {
            if (!this.titleStmtData[0].value) {
                alert('ID is not set! You must set it to save information to MEI file!');
                return;
            };

            if (!this.titleStmtData[1].value) {
                alert('Title is not set! You must set it to save information to MEI file!');
                return;
            };

            if (!this.getXpathNode(this.MEIData, './/mei:titleStmt')) {
                this.createNodesMethods(this.MEIData, 'titleStmt');
            };
            this.updateNodesMethods(this.MEIData, this.titleStmtData, 'titleStmt');

            this.TitleStmtOntMEI = this.prettifyXml(new XMLSerializer().serializeToString(this.getXpathNode(this.MEIData, './/mei:titleStmt')));

            if (openModal) {
                this.showModal = !this.showModal;
            } else {
                this.$emit("saveFinished", "TitleForm");
            }
        },
        getInfoFromMEI() {

            this.titleStmtData.forEach(item => {
                const node = this.getXpathNode(this.MEIData, item.tag);
                if (node) {
                    if (item.name === 'id') {
                        let possName = this.filename.split('.');
                        possName = possName.splice(0,possName.length - 1).join('.');
                        item.value = node.getAttribute('xml:id')?.trim() || possName;
                    } else if (item.name === 'title') {
                        item.value = node.textContent;
                    } else if (item.name === 'informer') {
                        item.value = node.childNodes[0].textContent?.trim() || '';
                    } else {
                        item.value = node.textContent?.trim() || '';
                    }
                }
            });
        }
    }
};
</script>

<style scoped>
#MEI-Modal-TitleStmt {
    max-height: 80% !important;
}
</style>