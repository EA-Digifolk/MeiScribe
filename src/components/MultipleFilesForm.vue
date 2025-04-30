<template>
    <div class="carousel-inner">
        <TitleStmtForm class="carousel-item active" :MEIFiles="MEIfiles" :export="exportData"
            @save-finished="allFormsReadyToExport['TitleForm'] = true; afterTrigger();" />
        <!--<PublisherForm class="carousel-item" :MEIFiles="MEIfiles" :export="exportData"
            @save-finished="allFormsReadyToExport['PublisherForm'] = true; afterTrigger();" />
        <SourceStmtForm class="carousel-item" :MEIFiles="MEIfiles" :export="exportData"
            @save-finished="allFormsReadyToExport['SourceForm'] = true; afterTrigger();" />
        <WorklistForm class="carousel-item" :MEIFiles="MEIfiles" :vT="verovioToolkit" :export="exportData"
            @save-finished="allFormsReadyToExport['WorklistForm'] = true; afterTrigger();" />-->
    </div>
</template>

<script module>
import { Tooltip } from 'bootstrap';

//import PublisherForm from './MultipleFileForm/PublisherForm.vue';
//import SourceStmtForm from './MultipleFileForm/SourceStmtForm.vue';
import TitleStmtForm from './MultipleFileForm/TitleStmtForm.vue';
//import WorklistForm from './MultipleFileForm/WorklistForm.vue';

export default {
    inject: ['getXpathNode', 'prettifyXml'],
    components: {
        TitleStmtForm,
        /*SourceStmtForm,
        PublisherForm,
        WorklistForm,*/
        Tooltip,
    },
    props: ['MEIfiles', 'exportData'],
    emits: ["downloadFinished"],
    mounted() {
        console.log(this.MEIfiles);
    },
    data() {
        return {
            allFormsReadyToExport: {
                'TitleForm': false,
                'PublisherForm': false,
                'SourceForm': false,
                'WorklistForm': false,
            },
        };
    },
    methods: {
        afterTrigger() {
            let checker = arr => arr.every(v => v === true);

            if (checker(Object.values(this.allFormsReadyToExport))) {

                this.allFormsReadyToExport = {
                    'TitleForm': false,
                    'PublisherForm': false,
                    'SourceForm': false,
                    'WorklistForm': false,
                };

                /*const a = document.createElement('a');
                const docString = this.prettifyXml(new XMLSerializer().serializeToString(this.xmlDoc));

                const blob = new Blob([docString], { type: 'application/xml' });
                a.setAttribute('href', URL.createObjectURL(blob));

                let filenameNode = this.getXpathNode(this.xmlDoc, './/mei:titleStmt//mei:title[@type="main"]');
                if (!filenameNode.getAttribute('xml:id')) {
                    alert('ID is not set! Try setting it before downloading MEI file!')
                }

                a.setAttribute('download', filenameNode.getAttribute('xml:id') + '.mei');
                a.click()
                a.remove()*/

                this.$emit("downloadFinished");
            };
        }
    },
};
</script>

<style scoped></style>