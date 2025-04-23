<template>

  <!-- HEADER -->
  <div class="container-xxl w-100">
    <nav class="w-100 navbar navbar-expand-lg navbar-light bg-light 2">
      <a class="navbar-brand p-2" href="#"><img src="/ea-digifolk-logo.png" width="20px" /> EA-Digifolk MEI
        Constructor</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <a class="nav-link" href="#" @click="MEIData = ''; openSingleForms = false;">Home <span class="sr-only">(current)</span></a>
          </li>
          <!--<li class="nav-item">
            <a class="nav-link" href="#">Link</a>
          </li>-->
        </ul>
      </div>
    </nav>

    <!--FILE FRAME-->
    <div class="container-xxl mb-5 mt-5" v-if="openSingleForms === false">
      <div class="row border bg-light p-2 pt-3">
        <p style="text-align: left"><b>MEI Convertor</b></p>
      </div>
      <div class="row ">
        <!-- File Input for MEI, MusicXML and MIDI -->
        <div class="col d-flex justify-content-start flex-wrap align-content-center border bg-light">
          <label class="w-100 p-3" style="text-align: left">Load MEI or MusicXML</label> <!--or MIDI (,.mid)-->
          <input class="w-100 p-3" type="file" @change="handleFiles" accept=".mei,.musicxml" />
        </div>
        <!-- File Input for MEI, MusicXML and MIDI from URL-->
        <div
          class="col d-flex flex-column flex-wrap-wrap align-content-center justify-content-center align-items-center border bg-light">
          <label class="row w-100 p-3" style="text-align: left">Load MEI or MusicXML from URL</label>
          <!--or MIDI (,.mid)-->
          <div class="row w-100 pt-3 align-items-center justify-content-center align-content-center">
            <input class="col col-sm-10 pt-2 pb-2 mt-0" type="text" v-model="urlFile" />
            <button class="col col-sm-1 p-0 ml-1" @click="handleURLFile"><svg-icon :path="downloadIcon" size="30"
                viewbox="0 0 30 30" style="color: black"></svg-icon></button>
          </div>

        </div>
      </div>
      <div class="row ">
        <!-- Textarea for ABC String -->
        <div class="col d-flex justify-content-start flex-wrap align-content-center border bg-light w-100">
          <textarea class="w-100" v-model="abcString" placeholder="Enter ABC string"></textarea>
        </div>
      </div>

      <div class="row justify-content-center mt-3">
        <button class="btn btn-primary w-100" @click="startProcess">Start</button>
      </div>
    </div>

    <!--MAIN FRAME-->
    <div class="container-xxl mb-5 mt-5 align-content-center" v-else>
      <button class="btn btn-primary" style="width: 95% !important" @click="exportMEI">Export MEI</button>

      <div id="carouselForms" class="container-xxl carousel carousel-dark slide w-100" data-bs-interval="false"
        data-bs-pause="hover"> <!--data-bs-interval="false"  data-bs-ride="carousel" -->

        <div class="carousel-indicators">
          <button type="button" data-bs-target="#carouselForms" data-bs-slide-to="0" class="active" aria-current="true"
            aria-label="Slide 1"></button>
          <button v-for="item in [...Array(6).keys()]" type="button" data-bs-target="#carouselForms"
            :data-bs-slide-to="item + 1" aria-label="Slide {{item+2}}"></button>
        </div>

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
          <!--<RhythmPatternForm class="carousel-item" :MEIData="xmlDoc" :vT="verovioToolkit" :export="exportData"
            @save-finished="allFormsReadyToExport['RhythmPatternForm'] = true; afterTrigger();" />
          <PhraseForm class="carousel-item" :MEIData="xmlDoc" :vT="verovioToolkit" :export="exportData"
            @save-finished="allFormsReadyToExport['SegmentationForm'] = true; afterTrigger();" />-->
        </div>

        <button class="carousel-control-prev" type="button" data-bs-target="#carouselForms" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carouselForms" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>

    <div v-if="message">{{ message }}</div>
  </div>
</template>

<script module>
import { Tooltip } from 'bootstrap';

import createVerovioModule from 'verovio/wasm';
import { VerovioToolkit } from 'verovio/esm';

import TitleStmtForm from './TitleStmtForm.vue';
import SourceStmtForm from './SourceStmtForm.vue';
import PublisherForm from './PublisherForm.vue';
import WorklistForm from './WorklistForm.vue';
import AmbitusForm from './AmbitusForm.vue';
import RhythmPatternForm from './RhythmPatternForm.vue';
import PhraseForm from './PhraseForm.vue';

export default {
  inject: ['getXpathNode', 'prettifyXml', 'createNodesMethods'],
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
  data() {
    return {
      MEIData: '',
      openSingleForms: false,
      fileData: '',
      fileName: '',
      abcString: '',
      urlFile: '',
      message: '',
      verovioToolkit: '',
      xmlDoc: '',
      exportData: false,
      allFormsReadyToExport: {
        'TitleForm': false,
        'PublisherForm': false,
        'SourceForm': false,
        'WorklistForm': false,
        'AmbitusForm': false,
        'RhythmPatternForm': false,
        'SegmentationForm': false
      },
      downloadIcon: "M19.99 6.21a4.49 4.49 0 0 0-8.82-.88A4.325 4.325 0 0 0 9.5 5a4.486 4.486 0 0 0-4.23 3.01A4.498 4.498 0 0 0 5.5 17H11v-5h1v9.086l-1.146-1.146-.707.707L12.5 23l2.353-2.353-.706-.707L13 21.085V17h5.5a5.497 5.497 0 0 0 1.49-10.79z",
    }
  },
  mounted() {
    this.startVerovio();
  },
  methods: {
    startVerovio() {
      createVerovioModule().then(VerovioModule => {
        this.verovioToolkit = new VerovioToolkit(VerovioModule);
      });
    },
    async handleFiles(event) {
      const file = event.target.files[0];
      if (file && file.name.endsWith('.mid')) {
        this.fileName = file.name;
      } else if (file) {
        const text = await file.text();
        this.fileData = text;
        this.fileName = file.name;
      }
    },
    async handleURLFile() {
      if (this.urlFile.startsWith('https://github.com/')) {
        // Transform Github Link 
        // from: https://github.com/EA-Digifolk/iFolk/blob/main/Spanish/ES-1913-B-JSV-001.mei
        // to: https://raw.githubusercontent.com/EA-Digifolk/iFolk/refs/heads/main/Spanish/ES-1913-B-JSV-001.mei
        let filenameS = this.urlFile.split('/');
        this.urlFile = 'https://raw.githubusercontent.com/' + filenameS[3] + '/' + filenameS[4] + '/refs/heads/' + filenameS[6] + '/' + filenameS[7] + '/' + filenameS[8];
      }
      if (this.urlFile != '') {
        const response = await fetch(this.urlFile);
        const data = await response.text();

        let filenameS = this.urlFile.split('/');
        this.fileData = data;
        this.fileName = filenameS[filenameS.length - 1];
      }
    },
    createALLMEICamps(meiTree) {
      this.createNodesMethods(meiTree, 'titleStmt');
      this.createNodesMethods(meiTree, 'publisher');
      this.createNodesMethods(meiTree, 'sourceStmt');
      this.createNodesMethods(meiTree, 'worklist');
      this.createNodesMethods(meiTree, 'ambitus');
      this.createNodesMethods(meiTree, 'rhythmPattern');
      this.createNodesMethods(meiTree, 'segmentation');
      return meiTree;
    },
    startProcess() {
      if (this.fileName.endsWith('.abc') || this.abcString !== '') {
        this.message = 'Loading ABC';
        this.verovioToolkit.loadData(this.abcString);
        this.MEIData = this.verovioToolkit.getMEI();
        this.message = '';
      } else if (this.fileName.endsWith('.musicxml')) {
        this.message = 'Loading MusicXML';
        this.verovioToolkit.loadData(this.fileData);
        this.MEIData = this.verovioToolkit.getMEI();
        this.message = '';
      } else if (this.fileName.endsWith('.mid')) {
        this.message = 'MIDI is not allowed for now';
      } else if (this.fileName.endsWith('.mei')) {
        this.message = 'Loading MEI';
        this.MEIData = this.fileData;
        this.verovioToolkit.loadData(this.fileData);
        this.message = '';
      } else {
        this.message = 'File type of ' + file.name + ' is not allowed at the moment!';
      };

      this.xmlDoc = (new DOMParser()).parseFromString(this.MEIData, "text/xml"); // Parse String to XML DOC to EDIT
      this.xmlDoc = this.createALLMEICamps(this.xmlDoc); // Create All Camps

      this.openSingleForms = true;
    },
    exportMEI() {
      this.exportData = !this.exportData;
    },
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

        this.openSingleForms = false;
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
