<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Ambitus (Pitch Range) Form</h4> <button href="#" class="btn-save-mei btn btn-primary ml-1"
                @click="saveToMEI">Apply To MEI</button>
        </div>
        <div class="card-body container">
            <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5 row w-100">
                <li class="row mb-1 w-50" v-for="item in ambitusData">
                    <div class="col col-sm-5 card-text" style="text-align: right">
                        <p class="card-text">{{ item.on_display }}</p>
                    </div>
                    <div class="col col-sm-7 card-text"> <input class="w-100 p-1" type="number" v-model="item.value"
                            :placeholder="item.default" /> </div>
                </li>
            </div>
        </div>
        <MusicalScore id="AmbitusForm" :vT="vT" />
    </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import MusicalScore from './MusicalScore.vue';
import * as music21 from 'music21j';

export default {
    components: {
        MusicalScore
    },
    props: ['MEIData', 'vT'],
    setup(props) {
        const ambitusData = ref([
            { name: 'lowest', tag: './/mei:ambNote[@type="lowest"]', value: 0, on_display: 'Lowest Pitch', default: 0 },
            { name: 'highest', tag: './/mei:ambNote[@type="highest"]', value: 128, on_display: 'Highest Pitch', default: 128 },
        ]);

        onMounted(() => {
            getInfoFromMEI();
        });

        const saveToMEI = () => {

            let ambitusNode = getXpathNode(props.MEIData, './/mei:ambitus');
            if (!ambitusNode) {
                let node = getXpathNode(props.MEIData, './/mei:scoreDef');

                const entriesN = ['ambitus'];
                for (let key in entriesN) {
                    let temp_node = document.createElementNS('http://www.music-encoding.org/ns/mei', entriesN[key]);
                    node.append(temp_node);
                    node = temp_node;
                }
                ambitusNode = node;
            }

            for (let i in ambitusData.value) {
                let item = ambitusData.value[i];
                let node = getXpathNode(props.MEIData, item.tag);

                if (!node) {
                    node = document.createElementNS('http://www.music-encoding.org/ns/mei','ambNote');
                    node.setAttribute('type', item.name );
                    ambitusNode.append(node);
                }

                if (node) {
                    // midi pitch to pname and oct
                    const n = new music21.pitch.Pitch(item.value);
                    node.setAttribute('pname', n.name.toLowerCase());
                    node.setAttribute('oct', n.octave);
                }
            }
        };

        const getXpathNode = (nodeP, xpath) => {
            const result = nodeP.evaluate(xpath, nodeP, prefix => prefix === 'mei' ? 'http://www.music-encoding.org/ns/mei' : null, XPathResult.ANY_TYPE, null);
            return result.iterateNext();
        }

        const getInfoFromMEI = () => {

            for (let i in ambitusData.value) {
                let item = ambitusData.value[i];
                let node = getXpathNode(props.MEIData, item.tag);
                if (node) {
                    const n = new music21.pitch.Pitch(node.getAttribute('pname') + node.getAttribute('oct'));
                    item.value = n.ps;
                } else {
                    // calculate ambitus from score
                    let midiPitches = props.vT.getDescriptiveFeatures()['pitchesIds'].map((element,index) => {
                        return props.vT.getMIDIValuesForElement(element[0])['pitch'];
                    });
                    if (item.name === 'highest') {
                        item.value = Math.max.apply(null, midiPitches);
                    } else {
                        item.value = Math.min.apply(null, midiPitches);
                    }
                }
            }
        };

        return {
            ambitusData,
            getXpathNode,
            getInfoFromMEI,
            saveToMEI,
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
