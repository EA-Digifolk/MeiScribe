<template>
  <div>
    <h1>MEI Constructor</h1>

    <!-- File Input for MEI -->
    <input type="file" @change="handleMEIFile" accept=".mei" />
    <button @click="loadMEI">Load MEI</button>

    <!-- File Input for MusicXML -->
    <input type="file" @change="handleMusicXMLFile" accept=".musicxml" />
    <button @click="convertMusicXML">Convert MusicXML</button>

    <!-- File Input for MIDI -->
    <input type="file" @change="handleMIDIFile" accept=".mid" />
    <button @click="convertMIDI">Convert MIDI</button>

    <!-- Textarea for ABC String -->
    <textarea v-model="abcString" placeholder="Enter ABC string"></textarea>
    <button @click="convertABC">Convert ABC</button>

    <!-- File Input for Export Path -->
    <input type="file" @change="handleExportFile" accept=".mei" />
    <button @click="exportMEI">Export MEI</button>

    <div v-if="message">{{ message }}</div>
    <div v-if="meiContent" v-html="meiContent"></div>
  </div>
</template>

<script>
import { ref } from 'vue';

import createVerovioModule from 'verovio/wasm';
import { VerovioToolkit } from 'verovio/esm';
import fs from 'node:fs';

export default {
  setup() {
    // Reactive references
    const MEIPath = ref('');
    const musicXMLPath = ref('');
    const abcString = ref('');
    const midiPath = ref('');
    const exportPath = ref('');
    const message = ref('');
    const meiContent = ref('');

    // File handling methods
    const handleMEIFile = (event) => {
      const file = event.target.files[0];
      if (file) {
        MEIPath.value = file.path; // Or use file.name for only the name
      }
    };

    const handleMusicXMLFile = (event) => {
      const file = event.target.files[0];
      if (file) {
        musicXMLPath.value = file; // Store the file object
      }
    };

    const handleMIDIFile = (event) => {
      const file = event.target.files[0];
      if (file) {
        midiPath.value = file.path; // Or use file.name
      }
    };

    const handleExportFile = (event) => {
      const file = event.target.files[0];
      if (file) {
        exportPath.value = file.path; // Or use file.name
      }
    };

    // Methods for API calls
    const loadMEI = async () => {
      message.value = 'MEI Loading logic to be implemented.';
      createVerovioModule().then(VerovioModule => {
        const verovioToolkit = new VerovioToolkit(VerovioModule);
        const score = fs.readFileSync(MEIPath.value).toString();
        verovioToolkit.loadData(score);
        const data = verovioToolkit.renderToSVG(1, {});
        message.value = data;
      });
    };

    const convertMusicXML = async () => {
      if (!musicXMLPath.value) {
        message.value = 'Please select a MusicXML file.';
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const musicXMLContent = e.target.result;

        // Here you would implement your logic to convert MusicXML to MEI
        // For demonstration, we're just going to mock the conversion
        meiContent.value = `<mei>${musicXMLContent}</mei>`;
        message.value = 'MusicXML converted to MEI successfully!';
      };

      reader.onerror = (error) => {
        message.value = `Error reading file: ${error.message}`;
      };

      reader.readAsText(musicXMLPath.value); // Read the file as text
    };

    // Placeholder for converting ABC string
    const convertABC = () => {
      message.value = 'ABC conversion logic to be implemented.';
    };

    // Placeholder for converting MIDI
    const convertMIDI = () => {
      message.value = 'MIDI conversion logic to be implemented.';
    };

    // Return reactive references and methods
    return {
      musicXMLPath,
      abcString,
      midiPath,
      exportPath,
      message,
      meiContent,
      loadMEI,
      convertMusicXML,
      handleMEIFile,
      handleMusicXMLFile,
      handleMIDIFile,
      handleExportFile,
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
