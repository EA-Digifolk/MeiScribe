<template>
    <div class="carousel-inner">
        <TitleStmtForm class="carousel-item active" :MEIFiles="MEIfiles" :export="exportData"
            @save-finished="allFormsReadyToExport['TitleForm'] = true; afterTrigger();" />
        <PublisherForm class="carousel-item" :MEIFiles="MEIfiles" :export="exportData"
            @save-finished="allFormsReadyToExport['PublisherForm'] = true; afterTrigger();" />
        <SourceStmtForm class="carousel-item" :MEIFiles="MEIfiles" :export="exportData"
            @save-finished="allFormsReadyToExport['SourceForm'] = true; afterTrigger();" />
        <WorklistForm class="carousel-item" :MEIFiles="MEIfiles" :vT="verovioToolkit" :export="exportData"
            @save-finished="allFormsReadyToExport['WorklistForm'] = true; afterTrigger();" />
        <AutomaticMusicForm class="carousel-item" :MEIFiles="MEIfiles" :vT="verovioToolkit" :export="exportData"
            @save-finished="allFormsReadyToExport['AutomaticMusicForm'] = true; afterTrigger();" />
    </div>
</template>

<script module>
import { Tooltip } from 'bootstrap';

import PublisherForm from './MultipleFileForm/PublisherForm.vue';
import SourceStmtForm from './MultipleFileForm/SourceStmtForm.vue';
import TitleStmtForm from './MultipleFileForm/TitleStmtForm.vue';
import WorklistForm from './MultipleFileForm/WorklistForm.vue';
import AutomaticMusicForm from './MultipleFileForm/AutomaticMusicForm.vue';

import JSZip from 'jszip';

export default {
    inject: ['getXpathNode', 'prettifyXml'],
    components: {
        TitleStmtForm,
        PublisherForm,
        SourceStmtForm,
        WorklistForm,
        AutomaticMusicForm,
        Tooltip,
    },
    props: ['MEIfiles', 'exportData'],
    emits: ["downloadFinished"],
    data() {
        return {
            allFormsReadyToExport: {
                'TitleForm': false,
                'PublisherForm': false,
                'SourceForm': false,
                'WorklistForm': false,
                //'AutomaticMusicForm': false,
            },
        };
    },
    methods: {
        async afterTrigger() {
            let checker = arr => arr.every(v => v === true);

            if (checker(Object.values(this.allFormsReadyToExport))) {

                this.allFormsReadyToExport = {
                    'TitleForm': false,
                    'PublisherForm': false,
                    'SourceForm': false,
                    'WorklistForm': false,
                    //'AutomaticMusicForm': false,
                };

                console.log(this.MEIfiles);

                const zip = new JSZip();

                this.MEIfiles.forEach((file) => {
                    const docString = this.prettifyXml(new XMLSerializer().serializeToString(file['xmlDoc']));
                    const blob = new Blob([docString], { type: 'application/xml' });
                    zip.file(file['filename'].split(".").slice(0, -1).join(".") + '.mei', blob);
                });

                const zipData = await zip.generateAsync({
                    type: "blob",
                    streamFiles: true
                });

                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(zipData);
                link.download = `meifiles.zip`;
                link.click();

                this.$emit("downloadFinished");
            };
        }
    },
};
</script>

<style scoped>
h1 {
    font-size: 2em;
}

input,
textarea {
    display: block;
    margin: 10px 0;
}

button {
    margin: 5px;
}

.carousel-control-next,
.carousel-control-prev {
    height: 80% !important;
    margin-top: 10%;
    width: 8% !important;
}
</style>