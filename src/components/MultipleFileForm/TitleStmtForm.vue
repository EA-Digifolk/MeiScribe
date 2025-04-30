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
                    <div class="col col-sm-10 card-text align-self-center">
                        <input class="input-text-sel p-1" type="text" v-model="item.value" :placeholder="item.default"
                            :disabled="item.select === false" />
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
            titleStmtData: [
                { name: 'composer', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="composer"]', value: '', select: false, on_display: 'Composer', default: '', tooltip: "<pre>Composer (optional)</pre>" },
                { name: 'compiler', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="compiler"]', value: '', select: false, on_display: 'Compiler', default: '', tooltip: "<pre>Compiler (optional): who compiled the song in a collection</pre>" },
                { name: 'informer', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="informer"]', value: '', select: false, on_display: 'Informer', default: '', tooltip: "<pre>Informer (optional): who told/sung the song</pre>" },
                { name: 'encoder', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="encoder"]', value: '', select: false, on_display: 'Encoder', default: '', tooltip: "<pre>Encoder (optional): who encoded the song as musicXML, MEI, ABC</pre>" },
                { name: 'editor', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="editor"]', value: '', select: false, on_display: 'Editor', default: '', tooltip: "<pre>Editor (optional): who edited the song</pre>" },
                { name: 'geogName', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="informer"]//mei:geogName', value: '', select: false, on_display: 'Geography', default: '', tooltip: "<pre>Geography (optional) information if the song is traditional from a specific region</pre>" },
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
            this.MEIFiles.forEach((file) => {
                if (!this.getXpathNode(file['xmlDoc'], './/mei:titleStmt')) {
                    this.createNodesMethods(file['xmlDoc'], 'titleStmt');
                };
                this.updateNodesMethods(file['xmlDoc'], this.titleStmtData.filter((item) => item.select === true), 'titleStmt');
            });

            this.TitleStmtOntMEI = this.prettifyXml(new XMLSerializer().serializeToString(this.getXpathNode(this.MEIFiles[0]['xmlDoc'], './/mei:titleStmt')));

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