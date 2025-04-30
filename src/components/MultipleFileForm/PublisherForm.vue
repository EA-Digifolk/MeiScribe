<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Publisher Form</h4>
            <button href="#" class="btn-save-mei btn btn-primary ml-1" title="Apply Information To MEI File"
                data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip" data-bs-placement="bottom"
                data-bs-html="true" @click="saveToMEI">Apply To MEI</button>
        </div>
        <div class="card-body container">
            <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5">
                <li class="row mb-1" v-for="item in pubData">
                    <div class="col col-sm-2 card-text" style="text-align: right">
                        <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                            data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{ item.on_display }}
                        </p>
                    </div>
                    <div class="col col-sm-10 card-text align-self-center">
                        <input v-if="item.name !== 'availability'" class="input-text-sel p-1" type="text"
                            v-model="item.value" :placeholder="item.default" :disabled="item.select === false" />
                        <textarea v-else class="input-text-sel p-1" v-model="item.value" :placeholder="item.default"
                            :disabled="item.select === false"></textarea>
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
                    <h3>Saved Publisher Statement to MEI File</h3>
                </template>
                <template #body>
                    <pre class="w-100" id="MEI-Modal-PublisherStmt">{{ PublisherStmtOntMEI }}</pre>
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
            pubData: [
                { name: 'publisher', tag: './/mei:pubStmt//mei:publisher', value: '', select: false, on_display: 'Publisher', default: 'EA-Digifolk Reseach Project', tooltip: `<pre>Publisher</pre>` },
                { name: 'date', tag: './/mei:pubStmt//mei:date', value: '', select: false, on_display: 'Date', default: '2024', tooltip: `<pre>Date (Year)</pre>` },
                { name: 'availability', tag: './/mei:pubStmt//mei:availability', select: false, value: '', on_display: 'Availability', tooltip: `<pre>Availability Notes</pre>`, default: `To the best of our knowledge, the full compositions on this site are in the public domain, the excerpts are in the public domain or are allowable under fair-use, and the few compositions that are still under copyright are used by permission. These scores, are provided for educational use only and are not to be used commercially.` },
            ],
            showModal: false,
            PublisherStmtOntMEI: ''
        };
    },
    mounted() {
        this.getInfoFromMEI();
        let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new Tooltip(tooltipTriggerEl, {
                'customClass': 'custom-tooltip',
                animated: 'fade',
                placement: 'bottom',
                trigger: 'hover'
            })
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
                if (!this.getXpathNode(file['xmlDoc'], './/mei:pubStmt')) {
                    this.createNodesMethods(file['xmlDoc'], 'pubStmt');
                };
                this.updateNodesMethods(file['xmlDoc'], this.pubData.filter((item) => item.select === true), 'pubStmt');
            });

            this.PublisherStmtOntMEI = this.prettifyXml(new XMLSerializer().serializeToString(this.getXpathNode(this.MEIFiles[0]['xmlDoc'], './/mei:pubStmt')));

            if (openModal) {
                this.showModal = !this.showModal;
            } else {
                this.$emit("saveFinished", "PublisherForm");
            }
        },
        getInfoFromMEI() {
        }
    },
};
</script>

<style scoped>
#MEI-Modal-PublisherStmt {
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
