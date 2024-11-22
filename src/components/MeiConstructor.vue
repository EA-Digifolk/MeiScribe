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
        <!-- Textarea for ABC String -->
        <div class="col d-flex flex-wrap-wrap align-content-center border bg-light">
          <textarea class="w-100" v-model="abcString" placeholder="Enter ABC string"></textarea>
        </div>
      </div>
      <div class="row justify-content-center">
        <button class="btn btn-primary w-100" @click="startProcess">Start</button>
      </div>
    </div>
    <div class="container-xxl mb-5 mt-5 align-content-center" v-else>
      <button class="btn btn-primary" style="width: 95% !important" @click="exportMEI">Export MEI</button>

      <div id="carouselForms" class="container-xxl carousel carousel-dark slide w-100" data-bs-interval="false" data-bs-pause="hover"> <!--data-bs-interval="false"  data-bs-ride="carousel" -->

        <div class="carousel-indicators">
          <button type="button" data-bs-target="#carouselForms" data-bs-slide-to="0" class="active"
            aria-current="true" aria-label="Slide 1"></button>
          <button v-for="item in [...Array(6).keys()]" type="button" data-bs-target="#carouselForms" :data-bs-slide-to="item+1" aria-label="Slide {{item+2}}"></button>
        </div>

        <div class="carousel-inner">
          <TitleStmtForm class="carousel-item active" :MEIData="xmlDoc"/>
          <PublisherForm class="carousel-item" :MEIData="xmlDoc"/>
          <SourceStmtForm class="carousel-item" :MEIData="xmlDoc"/>
          <WorklistForm class="carousel-item" :MEIData="xmlDoc" :vT="verovioToolkit"/>
          <AmbitusForm class="carousel-item" :MEIData="xmlDoc" :vT="verovioToolkit"/>
          <RhythmPatternForm class="carousel-item" :MEIData="xmlDoc" :vT="verovioToolkit"/>
          <PhraseForm class="carousel-item" :MEIData="xmlDoc" :vT="verovioToolkit"/>
        </div>

        <button class="carousel-control-prev" type="button" data-bs-target="#carouselForms"
          data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carouselForms"
          data-bs-slide="next">
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
import * as music21 from 'music21j';

import TitleStmtForm from './TitleStmtForm.vue';
import SourceStmtForm from './SourceStmtForm.vue';
import PublisherForm from './PublisherForm.vue';
import WorklistForm from './WorklistForm.vue';
import AmbitusForm from './AmbitusForm.vue';
import RhythmPatternForm from './RhythmPatternForm.vue';
import PhraseForm from './PhraseForm.vue';

export default {
  components: {
    TitleStmtForm,
    SourceStmtForm,
    PublisherForm,
    WorklistForm,
    AmbitusForm,
    RhythmPatternForm,
    PhraseForm
  },
  setup() {
    // Reactive references
    const MEIData = ref('');
    const fileData = ref('');
    const fileName = ref('');
    const abcString = ref('');
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

      /* 
      CODE TO PLAY AUDIO
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      audioContext.resume();
      music21.common.urls.soundfontUrl = 'https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/';
      music21.miditools.loadSoundfont('clarinet', i => {
        const tn = music21.tinyNotation.TinyNotation('4/4 c4 d e f g1');
        tn.instrument = i;
        tn.playStream();
      });
      CODE TO WRITE NOTES
      const n = new music21.note.Note('F#');
      */

      xmlDoc.value = (new DOMParser()).parseFromString(MEIData.value, "text/xml");
    };

    const exportMEI = () => {

    };

    // Return reactive references and methods
    return {
      xmlDoc,
      MEIData,
      fileData,
      fileName,
      abcString,
      message,
      verovioToolkit,
      startVerovio,
      startProcess,
      handleFiles,
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

.carousel-control-next, .carousel-control-prev {
  height: 80% !important;
  margin-top: 10%;
  width: 8% !important;
}

</style>
