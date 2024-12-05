<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Rhythmic Patterns</h4> <button href="#" class="btn-save-mei btn btn-primary ml-1"
                @click="saveToMEI">Apply To MEI</button>
        </div>
        <div class="card-body container">
            <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5">
                <li class="row mb-1" v-for="item in rhythmPatternData">
                    <div class="col col-sm-2 card-text" style="text-align: right">
                        <p class="card-text">{{ item.on_display }}</p>
                    </div>
                    <div class="col col-sm-10 card-text"> <input class="w-100 p-1" type="text" v-model="item.value" @click="getMusicalRhythm"
                            :placeholder="item.default" /> </div>
                </li>
                <div class="row" id="pattern-canvas"></div>
            </div>
        </div>
        <MusicalScore id="RhythmPatternForm" :vT="vT" />
    </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue';
import MusicalScore from './MusicalScore.vue';
import * as music21 from 'music21j';

export default {
    components: {
        MusicalScore
    },
    props: ['MEIData', 'vT'],
    setup(props) {
        const rhythmPatternData = ref([
            { name: 'rhythm pattern', tag: './/mei:supplied[@type="rhythm pattern"]', value: '', on_display: 'Rhythm Pattern', default: '' },
        ]);

        onMounted(() => {
            getInfoFromMEI();
        });

        const saveToMEI = () => {
        };

        const getMusicalRhythm = () => {
            let streamM = new music21.stream.Stream();

            let pattern = rhythmPatternData.value[0].value.split(' ');

            for (let i in pattern) {
                //if (pattern[i] == ) 
                //const n = new music21.note.Note('B', pattern[i]);
                
            }

            streamM.renderOptions.scaleFactor = {x:.7,y:.7};
            streamM.renderOptions.staffLines = 1;
            streamM.renderOptions.displayClef = false;
            streamM.renderOptions.rightBarline = "none";
            
            let div = document.getElementById('pattern-canvas');
            streamM.appendNewDOM(div);
        };

        const getXpathNode = (nodeP, xpath) => {
            const result = nodeP.evaluate(xpath, nodeP, prefix => prefix === 'mei' ? 'http://www.music-encoding.org/ns/mei' : null, XPathResult.ANY_TYPE, null);
            return result.iterateNext();
        }

        const processNoteTag = (tag) => {
            if (tag.tagName == 'note') {
                let tagP = ' ' + tag.getAttribute('dur');
                if (tag.getAttribute('dots')) {
                    tagP += '.'.repeat(parseInt(tag.getAttribute('dots')));
                }
                return tagP;
            }
            return '';
        }

        const getInfoFromMEI = () => {

            for (let i in rhythmPatternData.value) {
                let item = rhythmPatternData.value[i];
                let node = getXpathNode(props.MEIData, item.tag);

                if (node) {
                    /*
                    - the string should contain the number of each note of the rhythm, i.e., 8 for 8th notes, 4 for quarter notes, etc.
                    - each number should be separated by a space
                    - if the notes should be beamed, they should be surrounded by brackets with a b just next to the first bracket, i.e., [b 8 8]
                    - if notes have dots, they should be next to the number
                    - Example of a rhythm_pattern: '[b 8 8] 4 [b 8 16 16] [b 8. 16]'
                    */
                    let tempRhythmStr = '';
                    for (let i in node.children) {
                        let rhythm = node.children[i];                        
                        if (rhythm.tagName == 'beam') {
                            tempRhythmStr += ' [b';
                            if (rhythm.getAttribute('tuplet')) {
                                tempRhythmStr += rhythm.getAttribute('tuplet');
                            }
                            for (let r2 in rhythm.children) {
                                tempRhythmStr += processNoteTag(rhythm.children[r2]);
                            }
                            tempRhythmStr += ']';
                        } else if (rhythm.tagName == 'note') {
                            tempRhythmStr += processNoteTag(rhythm);
                        }
                        rhythmPatternData.value[0].value = tempRhythmStr.slice(1);
                    }
                } else {
                }
            }
        };

        return {
            rhythmPatternData,
            getXpathNode,
            getInfoFromMEI,
            saveToMEI,
            processNoteTag,
            getMusicalRhythm
        };
    },
};
</script>

<style scoped>
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
