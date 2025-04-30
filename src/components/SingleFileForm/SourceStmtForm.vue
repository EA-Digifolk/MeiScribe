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
                    <div class="col col-sm-9 card-text"> <input class="w-100 p-1" :type="item.type" v-model="item.value"
                            :placeholder="item.default" /> </div>
                </li>
            </div>
        </div>
        <Teleport to="body">
            <modal :show="showModal" @close="showModal = false">
                <template #header>
                    <h3>Saved Source Statement to MEI File</h3>
                </template>
                <template #body>
                    <pre class="w-100" id="MEI-Modal-SourceStmt">{{ SourceStmtOntMEI }}</pre>
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
    props: ['MEIData', 'export'],
    emits: ["saveFinished"],
    data() {
        return {
            sourceStmtData: [
                { name: 'id', tag: './/mei:source', value: '', on_display: 'ID', default: 'CO-YEAR-RE-SUB', type: 'text', tooltip: `ID of Source (Book ID)` },
                { name: 'title', tag: './/mei:source//mei:title', value: '', on_display: 'Title', default: '', type: 'text', tooltip: `title of source (Book Title)` },
                { name: 'subtitle', tag: './/mei:source//mei:title[@type="subordinate"]', value: '', on_display: 'Subtitle', default: '', type: 'text', tooltip: `subtitle of source (Book Subtitle)` },
                { name: 'compiler', tag: './/mei:source//mei:respStmt//mei:persName[@role="compiler"]', value: '', on_display: 'Compiler', default: '', type: 'text', tooltip: `compiler of source (Book Compiler)` },
                { name: 'collaborator', tag: './/mei:source//mei:respStmt//mei:persName[@role="collaborator"]', value: '', on_display: 'Collaborator', default: '', type: 'text', tooltip: `collaborator of source (Book Collaborator)` },
                { name: 'bibliography', tag: './/mei:source//mei:respStmt//mei:persName[@role="bibliography"]', value: '', on_display: 'Bibliography', default: '', type: 'text', tooltip: `bibliograph of source (Book Bibliography)` },
                { name: 'introduction', tag: './/mei:source//mei:respStmt//mei:persName[@role="introduction"]', value: '', on_display: 'Introduction', default: '', type: 'text', tooltip: `introduction of source (Book Introduction, Prologues, etc.)` },
                { name: 'edition', tag: './/mei:source//mei:imprint//mei:respStmt//mei:persName[@role="edition"]', value: '', on_display: 'Edition', default: '', type: 'text', tooltip: `edition of source (Book Edition)` },
                { name: 'publisher', tag: './/mei:source//mei:publisher', value: '', on_display: 'Publisher', default: '', type: 'text', tooltip: `publisher of source (Book Publisher)` },
                { name: 'place', tag: './/mei:source//mei:pubPlace', value: '', on_display: 'Publication Place', default: '', type: 'text', tooltip: `place where source was published (Book Place)` },
                { name: 'date', tag: './/mei:source//mei:date', value: '', on_display: 'Publication Date', default: 2024, type: 'number', tooltip: `year of publication of source (Book Date)` },
                { name: 'pages', tag: './/mei:source//mei:extent[@type="pages"]', value: '', on_display: 'Number of Pages', default: 0, type: 'number', tooltip: `number of pages of source (Book Pages)` },
            ],
            showModal: false,
            SourceStmtOntMEI: ''
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
            let imprintNode = this.getXpathNode(this.MEIData, './/mei:source//mei:imprint');
            if (!imprintNode) {
                this.createNodesMethods('sourceStmt');
            };
            this.updateNodesMethods(this.MEIData, this.sourceStmtData, 'sourceStmt');

            this.SourceStmtOntMEI = this.prettifyXml(new XMLSerializer().serializeToString(this.getXpathNode(this.MEIData, './/mei:sourceDesc')));

            if (openModal) {
                this.showModal = !this.showModal;
            } else {
                this.$emit("saveFinished", "SourceForm");
            }
        },
        getInfoFromMEI() {
            this.sourceStmtData.forEach(item => {
                let node = this.getXpathNode(this.MEIData, item.tag);
                if (node) {
                    if (item.name === 'id') {
                        item.value = node.getAttribute('xml:id')
                    } else if (item.name === 'date' || item.name === 'pages') {
                        item.value = parseInt(node.textContent.replace(/\s+/g, ' ').trim());
                    } else {
                        item.value = node.textContent.replace(/\s+/g, ' ').trim();
                    }
                }
            })
        },
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
