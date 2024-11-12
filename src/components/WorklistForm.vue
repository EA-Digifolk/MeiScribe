<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Worklist Form</h4> <button href="#" class="btn-save-mei btn btn-primary ml-1"
                @click="saveToMEI">Apply To MEI</button>
        </div>
        <div class="card-body container">
            <div>
                <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5">
                    <li class="row" :class="{ 'w-100 mb-1': !['mode', 'tempo', 'genre', 'region', 'city'].includes(item.name) }"
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
                            <div class="col col-sm-1 card-text" style="text-align: right">
                                <p class="card-text">{{ worklistData[4].on_display }}</p>
                            </div>
                            <div class="col col-sm-5 card-text">
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
                                    <option v-for="k in ['Binary', 'Ternary', 'Free', 'Polyrhythmic']" :value="k">{{ k }}</option>
                                </datalist>
                            </div>
                            <div class="col col-sm-1 card-text" style="text-align: right">
                                <p class="card-text">{{ worklistData[6].on_display }}</p>
                            </div>
                            <div class="col col-sm-5 card-text">
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
                            <div class="col col-sm-1 card-text" style="text-align: right">
                                <p class="card-text">{{ worklistData[9].on_display }}</p>
                            </div>
                            <div class="col col-sm-5 card-text">
                                <input class="w-100" type="text" list="genreList" v-model="worklistData[9].value"
                                    :placeholder="worklistData[9].default" />
                                <datalist id="genreList">
                                    <option v-for="k in ['Children Song', 'Work Song', 'Dance', 'Lullaby']" :value="k">{{ k }}</option>
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
                                    <option v-for="k in ['Brazil', 'Colombia', 'Ireland', 'Mexico', 'Portugal', 'Spain',]" :value="k">{{ k }}</option>
                                </datalist>
                            </div>
                            <div class="col col-sm-1 card-text" style="text-align: right">
                                <p class="card-text">{{ worklistData[11].on_display }}</p>
                            </div>
                            <div class="col col-sm-5 card-text">
                                <input class="w-100" type="text" v-model="worklistData[11].value"
                                    :placeholder="worklistData[11].default" />
                            </div>
                        </div>

                        <div class="w-100 row" v-else-if="item.name === 'district'">
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text">{{ item.on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <input class="w-100" type="text" v-model="item.value"
                                    :placeholder="item.default" />
                            </div>
                            <div class="col col-sm-1 card-text" style="text-align: right">
                                <p class="card-text">{{ worklistData[13].on_display }}</p>
                            </div>
                            <div class="col col-sm-5 card-text">
                                <input class="w-100" type="text" v-model="worklistData[13].value"
                                    :placeholder="worklistData[13].default" />
                            </div>
                        </div>

                        <div class="w-0" v-else-if="['mode', 'tempo', 'genre', 'region', 'city'].includes(item.name)"></div>

                        <div class="w-100 row" v-else-if="['notes', 'lyrics'].includes(item.name)">
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text">{{ item.on_display }}</p>
                            </div>
                            <div class="col col-sm-10 card-text">
                                <textarea class="w-100 p-1 mb-0" type="text" v-model="worklistData[13].value" :placeholder="worklistData[13].default"></textarea>
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
                <div>
                    SCORE
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import { onMounted } from 'vue';

export default {
    props: ['MEIData'],
    setup(props) {

        const worklistData = ref([
            { name: 'title', tag: './/mei:workList//mei:title', value: '', on_display: 'Title', default: '' },
            { name: 'author', tag: './/mei:workList//mei:author', value: '', on_display: 'Author', default: '' },
            { name: 'lyrics', tag: './/mei:workList//mei:head', value: '', on_display: 'Lyrics', default: '' },
            { name: 'key', tag: './/mei:workList//mei:key', value: '', on_display: 'Key', default: '' },
            { name: 'mode', tag: './/mei:workList//mei:key', value: '', on_display: 'Mode', default: '' },
            { name: 'meter', tag: './/mei:workList//mei:meter', value: '', on_display: 'Meter', default: '' },
            { name: 'tempo', tag: './/mei:workList//mei:tempo', value: '', on_display: 'Tempo', default: '' },
            { name: 'language', tag: './/mei:workList//mei:language', value: '', on_display: 'Language', default: '' },
            { name: 'notes', tag: './/mei:workList//mei:annot', value: '', on_display: 'Notes', default: '' },
            { name: 'genre', tag: './/mei:workList//mei:term[@type="genre"]', value: '', on_display: 'Genre', default: '' },
            { name: 'country', tag: './/mei:workList//mei:term[@type="country"]', value: '', on_display: 'Country', default: '' },
            { name: 'region', tag: './/mei:workList//mei:term[@type="region"]', value: '', on_display: 'Region', default: '' },
            { name: 'district', tag: './/mei:workList//mei:term[@type="district"]', value: '', on_display: 'District', default: '' },
            { name: 'city', tag: './/mei:workList//mei:term[@type="city"]', value: '', on_display: 'City', default: '' },
        ]);

        onMounted(() => {

            //console.log(props.MEIData);
            getInfoFromMEI();
        });

        const saveToMEI = () => {
            for (let i in worklistData.value) {
                let item = worklistData.value[i];

                /*
                let node = getXpathNode(props.MEIData, item.tag);

                if (!node) {
                    console.log('No node with tag: ' + item.tag);
                    if (item.name == 'id') {
                        let nodeT = getXpathNode(props.MEIData, worklistData.value[1].tag);
                        if (!nodeT.hasAttribute('type')) {
                            nodeT.setAttribute('type', "main");
                        }; node = nodeT;
                    } else if (item.name == 'subtitle') {
                        let nodeT = getXpathNode(props.MEIData, worklistData.value[1].tag);
                        let node = document.createElementNS('http://www.music-encoding.org/ns/mei', 'title');
                        node.setAttribute('type', 'subtitle');
                        nodeT.insertAdjacentElement("afterend", node);
                    } else if (item.name == 'geogName') {
                        console.log(props.MEIData);
                        let nodeR = getXpathNode(props.MEIData, worklistData.value[8].tag);
                        let node = document.createElementNS('http://www.music-encoding.org/ns/mei', 'geogName');
                        nodeR.append(node);
                    } else {
                        let nodeR = getXpathNode(props.MEIData, './/mei:titleStmt//mei:respStmt');
                        let node = document.createElementNS('http://www.music-encoding.org/ns/mei', 'persName');
                        node.setAttribute('role', item.name);
                        nodeR.append(node);
                    }
                }

                if (node) {
                    if (item.name == 'id') {
                        node.setAttribute('xml:id', item.value)
                    } else if (item.name == 'informer') {
                        let tempChildren = node.children[0]
                        node.textContent = item.value;
                        node.append(tempChildren);
                    } else {
                        node.textContent = item.value;
                    }
                }*/
            }

            console.log(props.MEIData)
        };

        const getXpathNode = (nodeP, xpath) => {
            const result = nodeP.evaluate(xpath, nodeP, prefix => prefix === 'mei' ? 'http://www.music-encoding.org/ns/mei' : null, XPathResult.ANY_TYPE, null);
            return result.iterateNext();
        }

        const getInfoFromMEI = () => {

            for (let i in worklistData.value) {
                let item = worklistData.value[i];
                let node = getXpathNode(props.MEIData, item.tag);
                if (node) {
                    if (item.name == 'id') {
                        item.value = node.getAttribute('xml:id')
                    } else {
                        item.value = node.textContent;
                    }
                }
            }
        };

        return {
            worklistData,
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
