<template>
  <div>
    <h1>MEI Constructor</h1>

    <!-- File Input for MEI, MusicXML and MIDI -->
    <div >
      <label>Load MEI, MusicXML or MIDI</label>
      <input type="file" @change="handleFiles" accept=".mei,.musicxml,.mid" />
    </div>
    
    <!-- Textarea for ABC String -->
    <div>
      <textarea v-model="abcString" placeholder="Enter ABC string"></textarea>
      <button @click="convertABC">Convert ABC</button>
    </div>

    <div v-if="message">{{ message }}</div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { onMounted } from 'vue'

import createVerovioModule from 'verovio/wasm';
import { VerovioToolkit } from 'verovio/esm';

export default {
  setup() {
    // Reactive references
    const MEIData = ref('');
    const musicXMLData= ref('');
    const abcString = ref('');
    const midiData = ref('');
    const exportPath = ref('');
    const message = ref('');
    const verovioToolkit = ref('');

    onMounted(() => {
      console.log(`the component is now mounted.`);
      startVerovio()
    });

    const startVerovio = () => {
      createVerovioModule().then(VerovioModule => {
        verovioToolkit.value = new VerovioToolkit(VerovioModule);
      });
    }

    const convertMusicXML = async () => {
      message.value = 'MusicXML conversion logic to be implemented.';
    };

    // Placeholder for converting MIDI
    const convertMIDI = () => {
      message.value = 'MIDI conversion logic to be implemented.';
    };

    // File handling methods
    const handleFiles = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const text = await file.text();
        
        if (file.name.endsWith('.musicxml')) {
          message.value = 'Loading MusicXML';
        } 
        else if (file.name.endsWith('.mid')) {
          message.value = 'Loading MIDI';
        } 
        else if (file.name.endsWith('.mei')) {
          message.value = 'Loading MEI';
          MEIData.value = text;
        } 
        else {
          message.value = 'File type of ' + file.name + ' is not allowed at the moment!';
        };
      }
    };

    // Placeholder for converting ABC string
    const convertABC = () => {
      message.value = 'ABC conversion logic to be implemented.';
    };


    // Return reactive references and methods
    return {
      musicXMLData,
      abcString,
      midiData,
      exportPath,
      message,
      convertMusicXML,
      convertMIDI,
      convertABC,
      handleFiles,
    };
  },
};
</script>

<style scoped>
h1 {
  font-size: 2em;
}
input, textarea {
  display: block;
  margin: 10px 0;
}
button {
  margin: 5px;
}
</style>
