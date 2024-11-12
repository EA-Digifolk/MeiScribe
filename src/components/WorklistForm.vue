<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Worklist Form</h4> <button href="#" class="btn-save-mei btn btn-primary ml-1"
                @click="saveToMEI">Apply To MEI</button>
        </div>
        <div class="card-body container">
            <div>
                <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5">
                    <li class="row mb-1" v-for="item in worklistData">
                        <div class="col col-sm-2 card-text" style="text-align: right">
                            <p class="card-text">{{ item.on_display }}</p>
                        </div>
                        <div class="col col-sm-10 card-text"> <input class="w-100 p-1" type="text" v-model="item.value"
                                :placeholder="item.default" /> </div>
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

        /*
        - title (string): title of song
        - author (string): author/informant of song
        - lyrics (string): complete lyrics of song
        - key (string): key of song (e.g., C, E Flat)
        - mode (string): mode of song (e.g., Major, Minor)
        - meter (string): meter of song [enum: Binary, Ternary, Free, Polyrhythmic]
        - tempo (string): tempo indication of song (e.g., Allegro)
        - language (string): language of lyrics
        - notes (string): optional annotations
        - genre (string): genre of song (e.g., Children Song, Work Song, Dance, Lullaby)
        - country (string): country from where the song came
        - region (string): region of the country from where the song came
        - district (string): district of the region from where the song came
        - city (string): city of the district from where the song came
        */
        const worklistData = ref([
            { name: 'title', tag: '.', value: '', on_display: 'Title', default: '' },
            { name: 'author', tag: '', value: '', on_display: 'Author', default: '' },
            { name: 'lyrics', tag: '', value: '', on_display: 'Lyrics', default: '' },
            { name: 'key', tag: '', value: '', on_display: 'Key', default: '' },
            { name: 'mode', tag: '', value: '', on_display: 'Mode', default: '' },
            { name: 'meter', tag: '', value: '', on_display: 'Meter', default: '' },
            { name: 'tempo', tag: '', value: '', on_display: 'Tempo', default: '' },
            { name: 'language', tag: '', value: '', on_display: 'Language', default: '' },
            { name: 'notes', tag: '', value: '', on_display: 'Notes', default: '' },
            { name: 'genre', tag: '', value: '', on_display: 'Genre', default: '' },
            { name: 'country', tag: '', value: '', on_display: 'Region', default: '' },
            { name: 'region', tag: '', value: '', on_display: 'Region', default: '' },
            { name: 'district', tag: '', value: '', on_display: 'District', default: '' },
            { name: 'city', tag: '', value: '', on_display: 'City', default: '' },
        ]);

        onMounted(() => {

            //console.log(props.MEIData);
            getInfoFromMEI();
        });

        const saveToMEI = () => {
            for (let i in worklistData.value) {
                let item = worklistData.value[i];
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
                }
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
