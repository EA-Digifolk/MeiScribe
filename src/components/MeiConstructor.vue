<template>
  <div>
    <h1>MEI Constructor</h1>

    <div class="container-lg mb-5 mt-5">
      <div class="row ">
        <!-- File Input for MEI, MusicXML and MIDI -->
        <div class="col d-flex justify-content-start flex-wrap align-content-center border">
          <label class="w-100" style="text-align: left">Load MEI or MusicXML</label> <!--or MIDI (,.mid)-->
          <input class="w-100" type="file" @change="handleFiles" accept=".mei,.musicxml" />
        </div>
        <!-- Textarea for ABC String -->
        <div class="col d-flex flex-wrap-wrap align-content-center border">
          <textarea class="w-100" v-model="abcString" placeholder="Enter ABC string"></textarea>
        </div>
      </div>
      <div class="row justify-content-center">         
        <button class="w-100" @click="startProcess">Start</button>
      </div>
    </div>

    <div v-if="message">{{ message }}</div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { onMounted } from 'vue'

import createVerovioModule from 'verovio/wasm';
import { VerovioToolkit } from 'verovio/esm';
import * as music21 from 'music21j';


export default {
  setup() {
    // Reactive references
    const MEIData = ref('');
    const fileData = ref('');
    const fileName = ref('');
    const abcString = ref('');
    const message = ref('');
    const verovioToolkit = ref('');

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
      if (fileName.value.endsWith('.abc')) {
        message.value = 'Loading ABC';
        verovioToolkit.value.loadData(abcString);
        MEIData.value = verovioToolkit.value.getMEI();
      } else if (fileName.value.endsWith('.musicxml')) {
        message.value = 'Loading MusicXML';
        verovioToolkit.value.loadData(fileData.value);
        MEIData.value = verovioToolkit.value.getMEI();
      } else if (fileName.value.endsWith('.mid')) {
        message.value = 'MIDI is not allowed for now';
        console.log(fileData.value);
        console.log(music21.converter.parseData(fileData.value));
      } else if (fileName.value.endsWith('.mei')) {
        message.value = 'Loading MEI';
        MEIData.value = fileData.value;
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

    };

    // Return reactive references and methods
    return {
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
