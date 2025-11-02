<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Source Statement Form</h4>
            <button href="#" class="btn-save-mei btn btn-primary ml-1" title="Apply Information To MEI File"
                data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip" data-bs-placement="bottom"
                data-bs-html="true" @click="saveToMEI">Apply To MEI</button>
        </div>
        <div class="card-body container">
            <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5">
                <li class="row mb-1" v-for="item in sourceStmtData">
                    <div class="col col-sm-3 card-text" style="text-align: right">
                        <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                            data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{ item.on_display }}
                        </p>
                    </div>
                    <div class="col col-sm-9 card-text  align-self-center">
                        <input class="input-text-sel p-1" :type="item.type" v-model="item.value"
                            :placeholder="item.default" :disabled="item.select === false" />
                        <input class="input-check-sel p-1" type="checkbox" v-model="item.select"
                            title="Edit Information" data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip"
                            data-bs-placement="top" data-bs-html="true" />
                    </div>

                </li>
            </div>
        </div>
        <Teleport to="body">
            <modal :show="showModal" @close="showModal = false">
                <template #header>
                    <h3>Saved Source Statement to MEI File</h3>
                </template>
                <template #body>
                    <div class="accordion accordion-flush" id="accordionSource">
                        <div v-for="(file, item) in MEIFiles" class="accordion-item" :id="'accordionItem-' + item">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                    :data-bs-target="'#flushM-collapse' + item" aria-expanded="false"
                                    :aria-controls="'flushM-collapse' + item">
                                    {{ file.filename }}
                                </button>
                            </h2>
                            <div :id="'flushM-collapse' + item" class="accordion-collapse collapse">
                                <div class="accordion-body p-4 bg-gray-900 text-black rounded font-mono">
                                    <pre><code>{{ getPrettified(file.xmlDoc) }}</code></pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </modal>
        </Teleport>
    </div>
</template>

<script type="module">
import Modal from '../Modal.vue';
import { Tooltip } from 'bootstrap';

export default {
    inject: ['getXpathNode', 'prettifyXml', 'createNodesMethods', 'updateNodesMethods'],
    components: {
        Tooltip,
        Modal
    },
    props: ['MEIFiles', 'export'],
    emits: ["saveFinished"],
    data() {
        return {
            sourceStmtData: [
                { name: 'id', tag: './/mei:source', value: '', select: false, on_display: 'ID', default: 'CO-YEAR-RE-SUB', type: 'text', tooltip: `ID of Source (Book ID)` },
                { name: 'title', tag: './/mei:source//mei:title', value: '', select: false, on_display: 'Title', default: '', type: 'text', tooltip: `title of source (Book Title)` },
                { name: 'subtitle', tag: './/mei:source//mei:title[@type="subordinate"]', value: '', select: false, on_display: 'Subtitle', default: '', type: 'text', tooltip: `subtitle of source (Book Subtitle)` },
                { name: 'compiler', tag: './/mei:source//mei:respStmt//mei:persName[@role="compiler"]', value: '', select: false, on_display: 'Compiler', default: '', type: 'text', tooltip: `compiler of source (Book Compiler)` },
                { name: 'collaborator', tag: './/mei:source//mei:respStmt//mei:persName[@role="collaborator"]', value: '', select: false, on_display: 'Collaborator', default: '', type: 'text', tooltip: `collaborator of source (Book Collaborator)` },
                { name: 'bibliography', tag: './/mei:source//mei:respStmt//mei:persName[@role="bibliography"]', value: '', select: false, on_display: 'Bibliography', default: '', type: 'text', tooltip: `bibliograph of source (Book Bibliography)` },
                { name: 'introduction', tag: './/mei:source//mei:respStmt//mei:persName[@role="introduction"]', value: '', select: false, on_display: 'Introduction', default: '', type: 'text', tooltip: `introduction of source (Book Introduction, Prologues, etc.)` },
                { name: 'edition', tag: './/mei:source//mei:imprint//mei:respStmt//mei:persName[@role="edition"]', value: '', select: false, on_display: 'Edition', default: '', type: 'text', tooltip: `edition of source (Book Edition)` },
                { name: 'publisher', tag: './/mei:source//mei:publisher', value: '', select: false, on_display: 'Publisher', default: '', type: 'text', tooltip: `publisher of source (Book Publisher)` },
                { name: 'place', tag: './/mei:source//mei:pubPlace', value: '', select: false, on_display: 'Publication Place', default: '', type: 'text', tooltip: `place where source was published (Book Place)` },
                { name: 'date', tag: './/mei:source//mei:date', value: '', select: false, on_display: 'Publication Date', default: 2024, type: 'number', tooltip: `year of publication of source (Book Date)` },
                { name: 'pages', tag: './/mei:source//mei:extent[@type="pages"]', value: '', select: false, on_display: 'Number of Pages', default: 0, type: 'number', tooltip: `number of pages of source (Book Pages)` },
            ],
            showModal: false,
        };
    },
    mounted() {
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
        getPrettified(xmlDoc) {
            return this.prettifyXml(new XMLSerializer().serializeToString(this.getXpathNode(xmlDoc, './/mei:sourceDesc')));
        },
        saveToMEI(openModal = true) {

            this.MEIFiles.forEach((file) => {
                if (!this.getXpathNode(file['xmlDoc'], './/mei:source//mei:imprint')) {
                    this.createNodesMethods(file['xmlDoc'], 'sourceStmt');
                };
                this.updateNodesMethods(file['xmlDoc'], this.sourceStmtData.filter((item) => item.select === true), 'sourceStmt');
            });

            if (openModal) {
                this.showModal = !this.showModal;
            } else {
                this.$emit("saveFinished", "SourceForm");
            }
        },
    },
};
</script>

<style scoped>
.input-text-sel {
    width: 90%;
}

.input-check-sel {
    width: 10%;
    height: 1rem;
}
</style>
