<template>

  <!-- HEADER -->
  <div class="container-xxl w-100">
    <nav class="w-100 navbar navbar-expand-lg navbar-light bg-light 2">
      <a class="navbar-brand p-2" href="#"><img src="/ea-digifolk-logo.png" width="20px" /> MEIScribe </a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <a class="nav-link" href="#" @click="resetWindow">Home <!--<span
                class="sr-only">(current)</span>--></a>
          </li>
          <!--<li class="nav-item">
            <a class="nav-link" href="#">Link</a>
          </li>-->
        </ul>
      </div>
    </nav>

    <!--FILE FRAME-->
    <div class="container-xxl mb-5 mt-5" v-if="openSingleForms === false && openMultiplesForm === false">
      <div class="row border bg-light p-2 pt-3">
        <p style="text-align: left"><b>MEIScribe - Import MusicXML, ABC or MEI Files</b></p>
      </div>
      <div class="row ">
        <!-- File Input for MEI, MusicXML and MIDI -->
        <div class="col d-flex justify-content-start flex-wrap align-content-center border bg-light">
          <label class="w-100 p-3" style="text-align: left">Load MEI or MusicXML File(s)</label> <!--or MIDI (,.mid)-->
          <input class="w-100 p-3" type="file" @change="handleFiles" accept=".mei,.musicxml" multiple />
        </div>
        <!-- File Input for MEI, MusicXML and MIDI from URL-->
        <div
          class="col d-flex flex-column flex-wrap-wrap align-content-center justify-content-center align-items-center border bg-light">
          <label class="row w-100 p-3" style="text-align: left">Load MEI or MusicXML File(s) from URL</label>
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

    <!--MAIN FRAME SINGLE FILE-->
    <div class="container-xxl mb-5 mt-5 align-content-center" v-else>
      <button class="btn btn-primary" style="width: 95% !important" @click="exportMEI">Export MEI</button>

      <div id="carouselForms" class="container-xxl carousel carousel-dark slide w-100" data-bs-interval="false"
        data-bs-pause="hover"> <!--data-bs-interval="false"  data-bs-ride="carousel" -->

        <div class="carousel-indicators">
          <button type="button" data-bs-target="#carouselForms" data-bs-slide-to="0" class="active" aria-current="true"
            aria-label="Slide 1"></button>
          <button v-for="item in getNumberOfTabs" type="button" data-bs-target="#carouselForms"
            :data-bs-slide-to="item + 1" aria-label="Slide {{item+2}}"></button>
        </div>

        <SingleFilesForm :xmlDoc="xmlDoc" :verovioToolkit="verovioToolkit" :exportData="exportData"
          v-if="openSingleForms === true"
          @download-finished="openSingleForms = false; verovioToolkit = ''; xmlDoc = '';" />
        <MultipleFilesForm :MEIfiles="files" :exportData="exportData" v-else-if="openMultiplesForm === true"
          @download-finished="openMultiplesForm = false; files = [];" />

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

import { VerovioToolkit } from 'verovio/esm';
import createVerovioModule from 'verovio/wasm';

import MultipleFilesForm from './MultipleFilesForm.vue';
import SingleFilesForm from './SingleFilesForm.vue';

function initialState() {
  return {
    MEIData: '',
    openSingleForms: false,
    openMultiplesForm: false,
    files: [],
    abcString: '',
    urlFile: '',
    message: '',
    verovioModule: '',
    verovioToolkit: '',
    xmlDoc: '',
    exportData: false,
    downloadIcon: "M19.99 6.21a4.49 4.49 0 0 0-8.82-.88A4.325 4.325 0 0 0 9.5 5a4.486 4.486 0 0 0-4.23 3.01A4.498 4.498 0 0 0 5.5 17H11v-5h1v9.086l-1.146-1.146-.707.707L12.5 23l2.353-2.353-.706-.707L13 21.085V17h5.5a5.497 5.497 0 0 0 1.49-10.79z",
  }
}

export default {
  inject: ['getXpathNode', 'prettifyXml', 'createNodesMethods'],
  components: {
    SingleFilesForm,
    MultipleFilesForm,
    Tooltip,
  },
  data() {
    return initialState()
  },
  mounted() {
    this.startVerovio();
  },
  computed: {
    getNumberOfTabs() {
      return this.openMultiplesForm === true ? [...Array(4).keys()] : [...Array(6).keys()]
    }
  },
  methods: {
    resetWindow: function (){
        Object.assign(this.$data, initialState());
        this.startVerovio();
    },
    startVerovio() {
      createVerovioModule().then(VerovioModule => {
        this.verovioModule = VerovioModule;
        this.verovioToolkit = new VerovioToolkit(VerovioModule);
      });
    },
    async handleFiles(event) {
      for (const file of event.target.files) {

        if (file && file.name) {
          let fileStructure = {};
          fileStructure['filename'] = file.name;
          if (!fileStructure['filename'].endsWith('.mid')) {
            const text = await file.text();
            fileStructure['fileData'] = text;
          }
          this.files.push(fileStructure);
        }

      };
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
        this.files.append({ 'filename': filenameS[filenameS.length - 1], 'fileData': data, 'url': this.urlFile });
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
    importSingleFile(file) {

      const vT = new VerovioToolkit(this.verovioModule);

      let MEIData = '';

      if (file["filename"].endsWith('.abc')) {
        this.message = 'Loading ABC';
        vT.loadData(file["fileData"]);
        MEIData = vT.getMEI();
        this.message = '';
      } else if (file["filename"].endsWith('.musicxml')) {
        this.message = 'Loading MusicXML';
        vT.loadData(file["fileData"]);
        MEIData = vT.getMEI();
        this.message = '';
      } else if (file["filename"].endsWith('.mei')) {
        this.message = 'Loading MEI';
        MEIData = file["fileData"];
        vT.loadData(file["fileData"]);
        this.message = '';
      } else if (file["filename"].endsWith('.mid')) {
        this.message = 'MIDI is not allowed for now';
        MEIData = null;
      } else {
        this.message = 'File type of ' + file.name + ' is not allowed at the moment!';
        MEIData = null;
      };

      return [MEIData, vT];
    },
    startProcess() {
      if (this.abcString !== '') {
        this.message = 'Loading ABC from abcString';
        this.verovioToolkit.loadData(this.abcString);
        this.MEIData = this.verovioToolkit.getMEI();
        this.message = '';
        this.xmlDoc = (new DOMParser()).parseFromString(this.MEIData, "text/xml"); // Parse String to XML DOC to EDIT
        this.xmlDoc = this.createALLMEICamps(this.xmlDoc); // Create All Camps
        this.openSingleForms = true;
        this.openMultiplesForm = false;
      } else if (this.files.length == 1) {
        [this.MEIData, this.verovioToolkit] = this.importSingleFile(this.files[0]);
        this.xmlDoc = (new DOMParser()).parseFromString(this.MEIData, "text/xml"); // Parse String to XML DOC to EDIT
        this.xmlDoc = this.createALLMEICamps(this.xmlDoc); // Create All Camps
        this.openSingleForms = true;
        this.openMultiplesForm = false;
      } else {
        this.files.forEach(file => {
          [file['meiData'], file['vT']] = this.importSingleFile(file);
          file['xmlDoc'] = (new DOMParser()).parseFromString(file['meiData'], "text/xml"); // Parse String to XML DOC to EDIT
          file['xmlDoc'] = this.createALLMEICamps(file['xmlDoc']); // Create All Camps
          this.openMultiplesForm = true;
          this.openSingleForms = false;
        });
      }
    },
    exportMEI() {
      this.exportData = !this.exportData;
    },
  }
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
