<template>
    <div class="carousel-inner">
        <TitleStmtForm class="carousel-item active" :MEIData="xmlDoc" :export="exportData"
            @save-finished="allFormsReadyToExport['TitleForm'] = true; afterTrigger();" />
        <PublisherForm class="carousel-item" :MEIData="xmlDoc" :export="exportData"
            @save-finished="allFormsReadyToExport['PublisherForm'] = true; afterTrigger();" />
        <SourceStmtForm class="carousel-item" :MEIData="xmlDoc" :export="exportData"
            @save-finished="allFormsReadyToExport['SourceForm'] = true; afterTrigger();" />
        <WorklistForm class="carousel-item" :MEIData="xmlDoc" :vT="verovioToolkit" :export="exportData"
            @save-finished="allFormsReadyToExport['WorklistForm'] = true; afterTrigger();" />
        <AmbitusForm class="carousel-item" :MEIData="xmlDoc" :vT="verovioToolkit" :export="exportData"
            @save-finished="allFormsReadyToExport['AmbitusForm'] = true; afterTrigger();" />
        <RhythmPatternForm class="carousel-item" :MEIData="xmlDoc" :vT="verovioToolkit" :export="exportData"
            @save-finished="allFormsReadyToExport['RhythmPatternForm'] = true; afterTrigger();" />
        <PhraseForm class="carousel-item" :MEIData="xmlDoc" :vT="verovioToolkit" :export="exportData"
            @save-finished="allFormsReadyToExport['SegmentationForm'] = true; afterTrigger();" />
    </div>
</template>

<script module>
import { Tooltip } from 'bootstrap';

import AmbitusForm from './SingleFileForm/AmbitusForm.vue';
import PhraseForm from './SingleFileForm/PhraseForm.vue';
import PublisherForm from './SingleFileForm/PublisherForm.vue';
import RhythmPatternForm from './SingleFileForm/RhythmPatternForm.vue';
import SourceStmtForm from './SingleFileForm/SourceStmtForm.vue';
import TitleStmtForm from './SingleFileForm/TitleStmtForm.vue';
import WorklistForm from './SingleFileForm/WorklistForm.vue';

export default {
    inject: ['getXpathNode', 'prettifyXml'],
    components: {
        TitleStmtForm,
        SourceStmtForm,
        PublisherForm,
        WorklistForm,
        AmbitusForm,
        RhythmPatternForm,
        PhraseForm,
        Tooltip,
    },
    props: ['xmlDoc', 'verovioToolkit', 'exportData'],
    emits: ["downloadFinished"],
    data() {
        return {
            allFormsReadyToExport: {
                'TitleForm': false,
                'PublisherForm': false,
                'SourceForm': false,
                'WorklistForm': false,
                'AmbitusForm': false,
                'RhythmPatternForm': false,
                'SegmentationForm': false
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
                    'AmbitusForm': false,
                    'RhythmPatternForm': false,
                    'SegmentationForm': false
                };

                const a = document.createElement('a');
                const docString = this.prettifyXml(new XMLSerializer().serializeToString(this.xmlDoc));

                const blob = new Blob([docString], { type: 'application/xml' });
                a.setAttribute('href', URL.createObjectURL(blob));

                let filenameNode = this.getXpathNode(this.xmlDoc, './/mei:titleStmt//mei:title[@type="main"]');
                if (!filenameNode.getAttribute('xml:id')) {
                    alert('ID is not set! Try setting it before downloading MEI file!')
                }

                a.setAttribute('download', filenameNode.getAttribute('xml:id') + '.mei');
                a.click()
                a.remove()

                //this.openSingleForms = false;
                this.$emit("downloadFinished");
            };
        }
    },
};
</script>

<style scoped></style>