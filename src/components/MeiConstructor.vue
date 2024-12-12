<template>
  <div class="container-xxl w-100">
    <h1>MEI Constructor</h1>

    <div class="container-xxl mb-5 mt-5" v-if="MEIData === ''">
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
      <div class="row justify-content-center">
        <button class="btn btn-primary w-100" @click="startProcess">Start</button>
      </div>
    </div>
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
          <TitleStmtForm class="carousel-item active" :MEIData="xmlDoc" />
          <PublisherForm class="carousel-item" :MEIData="xmlDoc" />
          <SourceStmtForm class="carousel-item" :MEIData="xmlDoc" />
          <WorklistForm class="carousel-item" :MEIData="xmlDoc" :vT="verovioToolkit" />
          <AmbitusForm class="carousel-item" :MEIData="xmlDoc" :vT="verovioToolkit" />
          <RhythmPatternForm class="carousel-item" :MEIData="xmlDoc" :vT="verovioToolkit" />
          <PhraseForm class="carousel-item" :MEIData="xmlDoc" :vT="verovioToolkit" />
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

<script>
import { ref } from 'vue';
import { onMounted } from 'vue';

import createVerovioModule from 'verovio/wasm';
import { VerovioToolkit } from 'verovio/esm';

import SvgIcon from "vue3-icon";

import TitleStmtForm from './TitleStmtForm.vue';
import SourceStmtForm from './SourceStmtForm.vue';
import PublisherForm from './PublisherForm.vue';
import WorklistForm from './WorklistForm.vue';
import AmbitusForm from './AmbitusForm.vue';
import RhythmPatternForm from './RhythmPatternForm.vue';
import PhraseForm from './PhraseForm.vue';

const downloadIcon = "M19.99 6.21a4.49 4.49 0 0 0-8.82-.88A4.325 4.325 0 0 0 9.5 5a4.486 4.486 0 0 0-4.23 3.01A4.498 4.498 0 0 0 5.5 17H11v-5h1v9.086l-1.146-1.146-.707.707L12.5 23l2.353-2.353-.706-.707L13 21.085V17h5.5a5.497 5.497 0 0 0 1.49-10.79z";

export default {
  components: {
    TitleStmtForm,
    SourceStmtForm,
    PublisherForm,
    WorklistForm,
    AmbitusForm,
    RhythmPatternForm,
    PhraseForm,
    downloadIcon,
    SvgIcon
  },
  setup() {
    // Reactive references
    const MEIData = ref('');
    const fileData = ref('');
    const fileName = ref('');
    const abcString = ref('');
    const urlFile = ref('');
    const message = ref('');
    const verovioToolkit = ref('');
    const xmlDoc = ref('');

    onMounted(() => {

      startVerovio();
    });

    const startVerovio = () => {
      createVerovioModule().then(VerovioModule => {
        verovioToolkit.value = new VerovioToolkit(VerovioModule);
      });
    }

    // File handling methods
    const handleFiles = async (event) => {
      const file = event.target.files[0];
      if (file && file.name.endsWith('.mid')) {

        fileName.value = file.name;
      } else if (file) {
        const text = await file.text();
        fileData.value = text;
        fileName.value = file.name;
      }
    };

    // File handling methods
    const handleURLFile = async () => {


      if (urlFile.value.startsWith('https://github.com/')) {
        // Transform Github Link 
        // from: https://github.com/EA-Digifolk/iFolk/blob/main/Spanish/ES-1913-B-JSV-001.mei
        // to: https://raw.githubusercontent.com/EA-Digifolk/iFolk/refs/heads/main/Spanish/ES-1913-B-JSV-001.mei

        let filenameS = urlFile.value.split('/');
        urlFile.value = 'https://raw.githubusercontent.com/' + filenameS[3] + '/' + filenameS[4] + '/refs/heads/' + filenameS[6] + '/' + filenameS[7] + '/' + filenameS[8];
      }

      
      if (urlFile.value != '') {
        const response = await fetch(urlFile.value);
        const data = await response.text();

        let filenameS = urlFile.value.split('/');
        fileData.value = data;
        fileName.value = filenameS[filenameS.length-1];
      }

    };

    const startProcess = () => {
      if (fileName.value.endsWith('.abc') || abcString.value !== '') {
        message.value = 'Loading ABC';
        verovioToolkit.value.loadData(abcString.value);
        MEIData.value = verovioToolkit.value.getMEI();
        message.value = '';
      } else if (fileName.value.endsWith('.musicxml')) {
        message.value = 'Loading MusicXML';
        verovioToolkit.value.loadData(fileData.value);
        MEIData.value = verovioToolkit.value.getMEI();
        message.value = '';
      } else if (fileName.value.endsWith('.mid')) {
        message.value = 'MIDI is not allowed for now';
        // console.log(fileData.value);
        // console.log(music21.converter.parseData(fileData.value));
        // message.value = '';
      } else if (fileName.value.endsWith('.mei')) {
        message.value = 'Loading MEI';
        MEIData.value = fileData.value;
        verovioToolkit.value.loadData(fileData.value);
        message.value = '';
      } else {
        message.value = 'File type of ' + file.name + ' is not allowed at the moment!';
      };

      xmlDoc.value = (new DOMParser()).parseFromString(MEIData.value, "text/xml");
    };

    const getXpathNode = (nodeP, xpath) => {
      const result = nodeP.evaluate(xpath, nodeP, prefix => prefix === 'mei' ? 'http://www.music-encoding.org/ns/mei' : null, XPathResult.ANY_TYPE, null);
      return result.iterateNext();
    };

    const exportMEI = () => {
      const a = document.createElement('a');
      const docString = new XMLSerializer().serializeToString(xmlDoc.value);

      const blob = new Blob([docString], { type: 'application/xml' });
      a.setAttribute('href', URL.createObjectURL(blob));

      let filenameNode = getXpathNode(xmlDoc.value, './/mei:titleStmt//mei:title[@type="main"]');
      if (!filenameNode.getAttribute('xml:id')) {
        alert('ID is not set! Try setting it before downloading MEI file!')
      }

      a.setAttribute('download', filenameNode.getAttribute('xml:id') + '.mei');
      a.click()
      a.remove()
    };

    // Return reactive references and methods
    return {
      xmlDoc,
      MEIData,
      fileData,
      fileName,
      abcString,
      urlFile,
      message,
      verovioToolkit,
      downloadIcon,
      SvgIcon,
      startVerovio,
      startProcess,
      handleFiles,
      handleURLFile,
      exportMEI,
    };
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
