<template>
  <div>
    <h1>MEI Constructor</h1>
    <input type="text" v-model="filePath" placeholder="Enter file path" />
    <button @click="loadMEI">Load MEI</button>

    <input
      type="text"
      v-model="musicXMLPath"
      placeholder="Enter MusicXML path"
    />
    <button @click="convertMusicXML">Convert MusicXML</button>

    <textarea v-model="abcString" placeholder="Enter ABC string"></textarea>
    <button @click="convertABC">Convert ABC</button>

    <input type="text" v-model="midiPath" placeholder="Enter MIDI path" />
    <button @click="convertMIDI">Convert MIDI</button>

    <input type="text" v-model="exportPath" placeholder="Enter export path" />
    <button @click="exportMEI">Export MEI</button>

    <div v-if="message">{{ message }}</div>
    <div v-if="meiContent" v-html="meiContent"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      filePath: '',
      musicXMLPath: '',
      abcString: '',
      midiPath: '',
      exportPath: '',
      message: '',
      meiContent: '',
    };
  },
  methods: {
    loadMEI() {
      // Here you can implement the logic to load MEI using the Python backend
      this.message = `Loading MEI from ${this.filePath}`;
      // Example: Call your backend API to load MEI
    },
    convertMusicXML() {
      this.message = `Converting MusicXML from ${this.musicXMLPath}`;
      // Example: Call your backend API to convert MusicXML
    },
    convertABC() {
      this.message = `Converting ABC: ${this.abcString}`;
      // Example: Call your backend API to convert ABC string
    },
    convertMIDI() {
      this.message = `Converting MIDI from ${this.midiPath}`;
      // Example: Call your backend API to convert MIDI
    },
    exportMEI() {
      this.message = `Exporting MEI to ${this.exportPath}`;
      // Example: Call your backend API to export MEI
    },
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

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
