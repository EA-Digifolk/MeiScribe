<template>
  <div>
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
        <button class="w-100" @click="startProcess">Start</button>
      </div>
    </div>
    <div class="container-xxl mb-5 mt-5" v-else>
      <div id="carouselExampleIndicators" class="carousel carousel-dark slide w-100" data-bs-ride="carousel">
        <div class="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" class="active"
            aria-current="true" aria-label="Slide 1"></button>
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1"
            aria-label="Slide 2"></button>
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2"
            aria-label="Slide 3"></button>
        </div>

        <div class="carousel-inner">
          <TitleStmtForm class="carousel-item active" :MEIData="xmlDoc"/>
          <div class="carousel-item">
            <img src="..." class="d-block w-100" alt="...">
          </div>
          <div class="carousel-item">
            <img src="..." class="d-block w-100" alt="...">
          </div>
        </div>

        <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators"
          data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators"
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

export default {
  components: {
    TitleStmtForm
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
      console.log(`the component is now mounted.`);
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
        console.log(fileData.value);
        console.log(music21.converter.parseData(fileData.value));
        message.value = '';
      } else if (fileName.value.endsWith('.mei')) {
        message.value = 'Loading MEI';
        MEIData.value = fileData.value;
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
</style>
