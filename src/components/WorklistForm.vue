<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Worklist Form</h4>
            <button href="#" class="btn-save-mei btn btn-primary ml-1" @click="saveToMEI">Apply To MEI</button>
        </div>
        <div class="card-body container">
            <div>
                <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5">
                    <li class="row"
                        :class="{ 'w-100 mb-1': !['mode', 'tempo', 'genre', 'region', 'city'].includes(item.name) }"
                        v-for="item in worklistData">
                        <div class="w-100 row" v-if="item.name === 'key'">
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text">{{ item.on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <select v-if="item.name == 'key'" class="w-100 p-1" type="text" v-model="item.value"
                                    :placeholder="item.default">
                                    <option
                                        v-for="k in ['Cb', 'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'E#', 'Fb', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B', 'B#']"
                                        :value="k">{{ k }}</option>
                                </select>
                            </div>
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text">{{ worklistData[4].on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <input class="w-100" type="text" list="modesList" v-model="worklistData[4].value"
                                    :placeholder="worklistData[4].default" />
                                <datalist id="modesList">
                                    <option
                                        v-for="k in ['Major', 'Minor', 'Ionian', 'Dorian', 'Lydian', 'Phrygian', 'Mixolydian', 'Aeolian', 'Locrian']"
                                        :value="k">{{ k }}</option>
                                </datalist>
                            </div>
                        </div>

                        <div class="w-100 row" v-else-if="item.name === 'meter'">
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text">{{ item.on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <input class="w-100" type="text" list="meterList" v-model="item.value"
                                    :placeholder="item.default" />
                                <datalist id="meterList">
                                    <option v-for="k in ['Binary', 'Ternary', 'Free', 'Polyrhythmic']" :value="k">{{ k
                                        }}</option>
                                </datalist>
                            </div>
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text">{{ worklistData[6].on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <input class="w-100" type="text" v-model="worklistData[6].value"
                                    :placeholder="worklistData[6].default" />
                            </div>
                        </div>

                        <div class="w-100 row" v-else-if="item.name === 'language'">
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text">{{ item.on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <input class="w-100" type="text" list="langList" v-model="item.value"
                                    :placeholder="item.default" />
                                <datalist id="langList">
                                    <option v-for="k in ['en', 'es', 'pt', 'it', 'cat']" :value="k">{{ k }}</option>
                                </datalist>
                            </div>
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text">{{ worklistData[9].on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <input class="w-100" type="text" list="genreList" v-model="worklistData[9].value"
                                    :placeholder="worklistData[9].default" />
                                <datalist id="genreList">
                                    <option v-for="k in ['Children Song', 'Work Song', 'Dance', 'Lullaby']" :value="k">
                                        {{ k }}</option>
                                </datalist>
                            </div>
                        </div>

                        <div class="w-100 row" v-else-if="item.name === 'country'">
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text">{{ item.on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <input class="w-100" type="text" list="countryList" v-model="item.value"
                                    :placeholder="item.default" />
                                <datalist id="countryList">
                                    <option
                                        v-for="k in ['Brazil', 'Colombia', 'Ireland', 'Mexico', 'Portugal', 'Spain',]"
                                        :value="k">{{ k }}</option>
                                </datalist>
                            </div>
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text">{{ worklistData[11].on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <input class="w-100" type="text" v-model="worklistData[11].value"
                                    :placeholder="worklistData[11].default" />
                            </div>
                        </div>

                        <div class="w-100 row" v-else-if="item.name === 'district'">
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text">{{ item.on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <input class="w-100" type="text" v-model="item.value" :placeholder="item.default" />
                            </div>
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text">{{ worklistData[13].on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <input class="w-100" type="text" v-model="worklistData[13].value"
                                    :placeholder="worklistData[13].default" />
                            </div>
                        </div>

                        <div class="w-0" v-else-if="['mode', 'tempo', 'genre', 'region', 'city'].includes(item.name)">
                        </div>

                        <div class="w-100 row" v-else-if="['notes', 'lyrics'].includes(item.name)">
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text">{{ item.on_display }}</p>
                            </div>
                            <div class="col col-sm-10 card-text">
                                <textarea class="w-100 p-1 mb-0" type="text" v-model="item.value"
                                    :placeholder="item.default"></textarea>
                            </div> <!--TODO: Check why text area leaving space under-->
                        </div>

                        <div class="w-100 row" v-else>
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text">{{ item.on_display }}</p>
                            </div>
                            <div class="col col-sm-10 card-text">
                                <input class="w-100 p-1" type="text" v-model="item.value" :placeholder="item.default" />
                            </div>
                        </div>
                    </li>
                </div>
            </div>
        </div>
        <button class="btn-show-score btn btn-primary mb-3" @click="showScore = !showScore">Show Score</button>
        <MusicalScore id="WorkListForm" :vT="vT" v-if="showScore" />
    </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import MusicalScore from './MusicalScore.vue';

export default {
    components: {
        MusicalScore
    },
    props: ['MEIData', 'vT'],
    setup(props) {

        const worklistData = ref([
            { name: 'title', tag: './/mei:workList//mei:title', value: '', on_display: 'Title', default: '' },
            { name: 'author', tag: './/mei:workList//mei:author', value: '', on_display: 'Author', default: '' },
            { name: 'lyrics', tag: './/mei:workList//mei:head', value: '', on_display: 'Lyrics', default: '' },
            { name: 'key', tag: './/mei:workList//mei:key', value: '', on_display: 'Key', default: '' },
            { name: 'mode', tag: './/mei:workList//mei:key', value: '', on_display: 'Mode', default: '' },
            { name: 'meter', tag: './/mei:workList//mei:meter', value: '', on_display: 'Meter', default: '' },
            { name: 'tempo', tag: './/mei:workList//mei:tempo', value: '', on_display: 'Tempo', default: '' },
            { name: 'language', tag: './/mei:workList//mei:langUsage//mei:language', value: '', on_display: 'Language', default: '' },
            { name: 'notes', tag: './/mei:workList//mei:annot', value: '', on_display: 'Notes', default: '' },
            { name: 'genre', tag: './/mei:workList//mei:term[@type="genre"]', value: '', on_display: 'Genre', default: '' },
            { name: 'country', tag: './/mei:workList//mei:term[@type="country"]', value: '', on_display: 'Country', default: '' },
            { name: 'region', tag: './/mei:workList//mei:term[@type="region"]', value: '', on_display: 'Region', default: '' },
            { name: 'district', tag: './/mei:workList//mei:term[@type="district"]', value: '', on_display: 'District', default: '' },
            { name: 'city', tag: './/mei:workList//mei:term[@type="city"]', value: '', on_display: 'City', default: '' },
        ]);
        const showScore = ref(false);

        onMounted(() => {
            //console.log(props.MEIData);
            getInfoFromMEI();
        });

        const saveToMEI = () => {

            let workListNode = getXpathNode(props.MEIData, './/mei:work');
            if (!workListNode) {
                let node = getXpathNode(props.MEIData, './/mei:meiHead');

                const entriesN = ['workList', 'work'];
                for (let key in entriesN) {
                    let temp_node = document.createElementNS('http://www.music-encoding.org/ns/mei', entriesN[key]);
                    node.append(temp_node);
                    node = temp_node;
                }

                workListNode = node;
            }

            for (let i in worklistData.value) {
                let item = worklistData.value[i];

                let node = getXpathNode(props.MEIData, item.tag);

                if (!node) {
                    console.log('No node with tag: ' + item.tag);
                    if (item.name == 'lyrics') {
                        let nodeINC = document.createElementNS('http://www.music-encoding.org/ns/mei', 'incip');
                        nodeINC.setAttribute('type', 'lyrics');
                        let nodeIText = document.createElementNS('http://www.music-encoding.org/ns/mei', 'incipText');
                        nodeINC.append(nodeIText);
                        nodeIText.append(document.createElementNS('http://www.music-encoding.org/ns/mei', 'head'));
                        workListNode.append(nodeINC);
                    } else if (item.name == 'notes') {
                        let nodeNSt = document.createElementNS('http://www.music-encoding.org/ns/mei', 'notesStmt');
                        nodeNSt.append(document.createElementNS('http://www.music-encoding.org/ns/mei', 'annot'));
                        workListNode.append(nodeNSt);
                    } else if (item.name == 'language') {
                        let nodeL = document.createElementNS('http://www.music-encoding.org/ns/mei', 'langUsage');
                        nodeL.append(document.createElementNS('http://www.music-encoding.org/ns/mei', 'language'));
                        workListNode.append(nodeL);
                    } else if (['genre', 'country', 'region', 'district', 'city'].includes(item.name)) {
                        let node = document.createElementNS('http://www.music-encoding.org/ns/mei', 'term');
                        node.setAttribute('type', item.name)
                        workListNode.append(node);
                    } else {
                        let node = document.createElementNS('http://www.music-encoding.org/ns/mei', item.name);
                        workListNode.append(node);
                    }
                }

                if (node) {
                    if (item.name == 'id') {
                        node.setAttribute('xml:id', item.value)
                    } else if (item.name == 'mode') {
                        node.setAttribute('mode', item.value)
                    } else if (item.name == 'language') {
                        node.setAttribute('xml:lang', item.value)
                    } else {
                        node.textContent = item.value;
                    }
                }
            }

            let nodeMusical = getXpathNode(props.MEIData, './/mei:workList//mei:incip[@type="musical"]');
            if (!nodeMusical) {
                nodeMusical = document.createElementNS('http://www.music-encoding.org/ns/mei', 'incip');
                nodeMusical.setAttribute('type', 'musical');
                getXpathNode(props.MEIData, worklistData.value[6].tag).insertAdjacentElement("afterend", nodeMusical);
            } else {
                while (nodeMusical.firstChild) {
                    nodeMusical.removeChild(nodeMusical.firstChild);
                }
            }

            let measures = getXpathNode(props.MEIData, './/mei:measure', true);
            let fM = measures.iterateNext();
            let sM = measures.iterateNext();
            nodeMusical.append(getMusicalIncipMeasure(fM));
            nodeMusical.append(getMusicalIncipMeasure(sM));

            //console.log(getXpathNode(props.MEIData, './/mei:workList'));
        };

        const getMusicalIncipMeasure = (meas) => {
            let docM = document.createElementNS('http://www.music-encoding.org/ns/mei', 'measure');
            docM.setAttribute('copyof', '#' + meas.getAttribute('xml:id'));
            return docM;
        };

        const getXpathNode = (nodeP, xpath, returnAll = false) => {
            const result = nodeP.evaluate(xpath, nodeP, prefix => prefix === 'mei' ? 'http://www.music-encoding.org/ns/mei' : null, XPathResult.ANY_TYPE, null);
            if (returnAll)
                return result;
            return result.iterateNext();
        };

        const getInfoFromMEI = () => {
            for (let i in worklistData.value) {
                let item = worklistData.value[i];
                let node = getXpathNode(props.MEIData, item.tag);
                if (node) {
                    if (item.name == 'id') {
                        item.value = node.getAttribute('xml:id');
                    } else if (item.name == 'mode') {
                        item.value = capitalizeFirstLetter(node.getAttribute('mode'));
                    } else if (item.name == 'language') {
                        item.value = node.getAttribute('xml:lang');
                    } else {
                        item.value = capitalizeFirstLetter(node.textContent);
                    }
                }
            };
        };



        const capitalizeFirstLetter = (string) => {
            return string && (string[0].toUpperCase() + string.slice(1));
        }

        return {
            worklistData,
            showScore,
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
