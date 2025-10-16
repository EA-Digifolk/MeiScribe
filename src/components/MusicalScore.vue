<template>
    <div class="card-body container score-div-cont">
        <div class="score-page-arrows">
            <div :id="id + '-ScoreSelectedID'" class="ScoreSelectedID"></div>
            <button class="" :disabled="pageToRender === 1" @click="prevPage">Previous</button>
            <div class=""> Page <input :disabled="numPages === 1" class="go-page-input" type="number"
                    v-model="pageToRender.value" :placeholder="pageToRender" :min="1" :max="numPages" /> / {{ numPages
                }}</div>
            <button class="" :disabled="pageToRender === numPages" @click="nextPage">Next</button>
        </div>
        <div :id="id + '-score-div-img'" class="score-div"></div>
        <div :id="id + '-midi-player'" class="m21-midi-player"></div>
    </div>
</template>

<script type="module">

import * as music21 from 'music21j';
import * as MidiWriter from 'midi-writer-js';

export default {
    inject: ['getNotesExpanded'],
    components: {
        // MidiPlayer
    },
    props: ['id', 'vT', 'meiTree', 'showIds', 'showMidiPitch'],
    emits: ['loadMIDI', 'startPlay'],
    data() {
        return {
            pageToRender: 1,
            numPages: 1,
            midi: '',
            play: false,
        }
    },
    mounted() {
        this.getScore();
    },
    watch: {
        pageToRender: async function (newValue, oldValue) {
            if (newValue != oldValue) {
                this.getScore()
            }
        }
    },
    methods: {
        prevPage() {
            if (this.pageToRender > 1) {
                this.pageToRender -= 1;
            }
        },
        nextPage() {
            if (this.pageToRender < this.numPages - 1) {
                this.pageToRender += 1;
            }
        },
        /**
         * Convert Uint8Array or ArrayBuffer to base64
        */
        arrayBufferToBase64(buffer) {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const chunkSize = 0x8000; // for large files

            for (let i = 0; i < bytes.length; i += chunkSize) {
                const chunk = bytes.subarray(i, i + chunkSize);
                binary += String.fromCharCode.apply(null, chunk);
            }

            return btoa(binary);
        },
        /**
         * Convert MIDI number to note name, e.g., 60 -> "C4"
         */
        midiToNoteName(midi) {
            const octave = Math.floor(midi / 12) - 1;
            const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
            return noteNames[midi % 12] + octave;
        },
        /**
         * Render flat MIDI notes to a base64-encoded string
         * @param {Array} flatMidi - [{pitch, time, duration, index}, ...] with time/duration in ms
         * @returns {string} base64-encoded MIDI file
         */
        renderMidiToBase64(flatMidi) {
            const track = new MidiWriter.Track();
            track.setTempo(120); // optional tempo

            const TICKS_PER_BEAT = 480;

            // Sort notes by start time
            flatMidi.sort((a, b) => a.time - b.time);

            let lastTime = 0;

            flatMidi.forEach((note) => {
                const waitTicks = Math.round(((note.time - lastTime) / 500) * TICKS_PER_BEAT); // 500ms = quarter note at 120 BPM
                const durationTicks = Math.round((note.duration / 500) * TICKS_PER_BEAT);

                track.addEvent(
                    new MidiWriter.NoteEvent({
                        pitch: [this.midiToNoteName(note.pitch)],
                        duration: "T" + durationTicks,
                        wait: "T" + waitTicks,
                    })
                );

                lastTime = note.time;
            });

            const writer = new MidiWriter.Writer(track);
            const midiArrayBuffer = writer.buildFile(); // in browser this is Uint8Array
            return this.arrayBufferToBase64(midiArrayBuffer);
        },
        getScore() {
            this.vT.setOptions({
                'adjustPageHeight': true,
                'svgViewBox': true,
                'svgBoundingBoxes': true,
                'breaksNoWidow': true,
                'systemMaxPerPage': 2,
                'svgAdditionalAttribute': 'note@id'
            });
            this.numPages = this.vT.getPageCount();

            let svg = this.vT.renderToSVG(this.pageToRender);
            let image = document.getElementById(this.id + '-score-div-img');
            image.innerHTML = svg.trim();

            if (this.showIds || this.showMidiPitch) {
                let notesOnSVG = document.getElementsByClassName('note');
                Array.from(notesOnSVG).forEach((e, _) => {
                    if (!e.classList.contains('bounding-box')) {
                        let sc = document.getElementById(this.id + '-ScoreSelectedID');
                        e.addEventListener('mouseenter', () => {
                            if (this.showIds) {
                                sc.innerHTML = 'ID: ' + e.id;
                            } else {
                                sc.innerHTML = 'PITCH: ' + this.vT.getMIDIValuesForElement(e.id)['pitch'];
                            }
                            sc.style.padding = '.4em';
                        });
                        e.addEventListener('mouseleave', () => {
                            sc.innerHTML = '';
                            sc.style.padding = '0em';
                        });
                    }
                });
            };

            music21.common.urls.midiPlayer = './midiPlayer'
            music21.common.urls.soundfontUrl = 'https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/';

            if (this.midi === '') {
                let notesExp = this.getNotesExpanded(this.vT, this.meiTree);
                this.midi = this.renderMidiToBase64(notesExp);
            }

            if (this.midi === '') {
                this.midi = this.vT.renderToMIDI();
            }

            let midiPlayer = new music21.miditools.MidiPlayer();
            midiPlayer.addPlayer(document.getElementById(this.id + '-midi-player'));
            midiPlayer.player.timeWarp = midiPlayer.speed;
            music21.miditools.loadSoundfont('fiddle', i => {
                midiPlayer.player.loadFile(
                    'data:audio/midi;base64,' + this.midi,
                    () => {
                        // success
                        midiPlayer.fileLoaded();
                    },
                    undefined, // loading
                    e => {
                        // failure
                        console.log(e);
                    }
                );
            });
        },
    },
}
</script>

<style>
.score-div-cont {
    display: flex !important;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    border: 1px solid black;
    margin-bottom: 1em;
}

.score-page-arrows {
    display: inline-flex;
    justify-content: space-evenly;
    align-items: stretch;
    width: 100%;
    margin-bottom: 1em;
}

.score-div {
    width: 90%;
    height: auto;
    max-height: 15em;
    overflow-y: auto;
}

.go-page-input {
    margin-left: 1em;
}

g.note.select-start {
    color: red !important;
    fill: red !important;
}

g.note.select-end {
    color: green !important;
    fill: green !important;
}

:hover.note {
    fill: dodgerblue;
    stroke: white;
    stroke-width: 2px;
    filter: url(#dropshadow);
}

.ScoreSelectedID {
    position: absolute;
    top: auto;
    left: 7%;
    background-color: dodgerblue;
    color: aliceblue;
}

.timeControls {
    width: 100% !important;
    top: -30px !important;
    left: -50px !important;
}

.timePlayed,
.timeRemaining {
    width: auto !important;
}

.m21-midi-player {
    margin-top: 2em !important;
}
</style>