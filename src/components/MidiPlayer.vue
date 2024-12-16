<template>
    <div class="midi-player hidden">
        <object id="Jazz1" classid="CLSID:1ACE1618-1C7D-4561-AEE1-34842AA85E90" class="hidden">
            <object id="Jazz2" type="audio/x-jazz" class="hidden">
                <p class="hidden;">This page requires <a href=http://jazz-soft.net>Jazz-Plugin </a> ...</p>
            </object> </object>
    </div>
</template>

<script module>
import { JZZ } from 'jzz';
import { SMF } from 'jzz-midi-smf';
import { Player } from 'jzz-gui-player';
import { Tiny } from 'jzz-synth-tiny';

SMF(JZZ);
Tiny(JZZ);
Player(JZZ);

export default {
    name: "MidiPlayer",
    props: ["midi", "playMidi"],
    emits: ["finishedPlaying"],
    data() {
        return {
            smf: null,
            player: null,
            out: null,

            saved_midi: null,
            playing: false,
        };
    },
    watch: {
        midi(val, oldVal) {
            if (!val || val === oldVal) return;
            //this.loadMidi(val);
        },
        playMidi(val, oldVal) {
            if (val === oldVal) return;
            //this.playStop();
        },
    },
    methods: {
        loadMidi(midi) {
            if (JZZ && midi && this.out) {
                if (this.playing && this.player) {
                    this.playing = false;
                    this.player.stop();
                }

                console.log('HERE MIDI LOAD 3')
                this.smf = new JZZ.MIDI.SMF(JZZ.lib.fromBase64(midi));
                this.player = this.smf.player();
                this.player.connect(this.out);
                this.saved_midi = midi;
            }
        },
        playStop() {
            if (!this.playing) {
                console.log(this.player)
                if (this.player) {
                    this.playing = true;
                    this.player.onEnd = () => {
                        this.playing = false;
                        this.$emit('finishedPlaying');
                    };
                    this.player.play();
                }
            } else {
                if (this.player) {
                    this.playing = false;
                    this.player.stop();
                }
            }
        },
    },
    mounted() {
        JZZ.synth.Tiny.register('Web Audio');
        JZZ.requestMIDIAccess({
            sysex: true,
        }).then(
            (access) => {
                console.log("access", access);
                console.log(
                    JZZ({
                        engine: ["webmidi"],
                        sysex: true,
                    }).info()
                );

                this.out = JZZ({
                    engine: ["webmidi"],
                    sysex: true,
                })
                    .or("Cannot start MIDI engine!")
                    .openMidiOut()
                    .or("Cannot open MIDI Out!").and(function () {
                        console.log('MIDI-Out:', this.name());
                    });
            },
            (error) => console.log("error", error)
        );
        JZZ.close();
    },
};
</script>

<style>
.hidden {
    opacity: 0;
    height: 0px;
    width: 0px;
    visibility: hidden;
    display: none;
}
</style>