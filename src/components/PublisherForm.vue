<template>
    <div class="card" style="width: 50em;">
        <h4 class="card-header">
            Publisher Form
        </h4>
        <div class="card-body container">
            <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5">
                <li class="row mb-1" v-for="item in pubData">
                    <div class="col col-sm-2 card-text" style="text-align: right">
                        <p class="card-text">{{ item.on_display }}</p>
                    </div>
                    <div class="col col-sm-10 card-text"> <input class="w-100 p-1" type="text" v-model="item.value"
                            :placeholder="item.default" /> </div>
                </li>
            </div>
            <button href="#" class="row btn btn-primary" @click="saveToMEI">Apply To MEI</button>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import { onMounted } from 'vue';

export default {
    props: ['MEIData'],
    setup(props) {
        const pubData = ref([
            { name: 'publisher', tag: './/mei:pubStmt//mei:publisher', value: '', on_display: 'Publisher', default: 'EA-Digifolk Reseach Project' },
            { name: 'date', tag: './/mei:pubStmt//mei:date', value: '', on_display: 'Date', default: '2024' },
            { name: 'availability', tag: './/mei:pubStmt//mei:availability', value: '', on_display: 'Publisher', default: "To the best of our knowledge, the full compositions on this site are in the public domain, the excerpts are in the public domain or are allowable under fair-use, and the few compositions that are still under copyright are used by permission. These scores, are provided for educational use only and are not to be used commercially." },
        ]);

        onMounted(() => {
            //console.log(props.MEIData);
            getInfoFromMEI();
        });

        const saveToMEI = () => {
            for (let i in pubData.value) {
                let item = pubData.value[i];
                let node = getXpathNode(props.MEIData, item.tag);

                if (!node) {
                    //console.log('No node with tag: ' + item.tag);
                    let nodeP = getXpathNode(props.MEIData, './/mei:pubStmt//');
                    let node = document.createElementNS('http://www.music-encoding.org/ns/mei', item.name);
                    nodeP.append(node);
                }
                if (node) {
                    node.textContent = item.value;
                }
            };
            //console.log(props.MEIData)
        };

        const getXpathNode = (nodeP, xpath) => {
            const result = nodeP.evaluate(xpath, nodeP, prefix => prefix === 'mei' ? 'http://www.music-encoding.org/ns/mei' : null, XPathResult.ANY_TYPE, null);
            return result.iterateNext();
        }

        const getInfoFromMEI = () => {
            for (let i in pubData.value) {
                let item = pubData.value[i];
                let node = getXpathNode(props.MEIData, item.tag);
                if (node) {
                    item.value = node.textContent;
                }
            }
        };

        return {
            pubData,
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
