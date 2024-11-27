<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Phrases and Segmentation</h4> <button href="#" class="btn-save-mei btn btn-primary ml-1"
                @click="saveToMEI">Apply To MEI</button>
        </div>
        <div class="card-body container">
            <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5">
                <li class="row mb-1" v-for="item in phraseSegmentData">
                    <div class="col col-sm-2 card-text" style="text-align: right">
                        <p class="card-text">{{ item.on_display }}</p>
                    </div>
                    <div class="col col-sm-10 card-text"> <input class="w-100 p-1" type="text" v-model="item.value"
                            :placeholder="item.default" /> </div>
                </li>
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
        const phraseSegmentData = ref([
            { name: 'phrases', tag: './/mei:music//mei:section//mei:supplied[@type="phrases"]', value: [], on_display: 'Phrases' },
        ]);

        onMounted(() => {
            
            //console.log(props.MEIData);
            getInfoFromMEI();
        });

        const saveToMEI = () => {
            
        };

        const getXpathNode = (nodeP, xpath) => {
            const result = nodeP.evaluate(xpath, nodeP, prefix => prefix === 'mei' ? 'http://www.music-encoding.org/ns/mei' : null, XPathResult.ANY_TYPE, null);
            return result.iterateNext();
        }

        const getInfoFromMEI = () => {

            for (let i in phraseSegmentData.value) {
                let item = phraseSegmentData.value[i];
                let node = getXpathNode(props.MEIData, item.tag);
                
                if (node) {
                    for (let i in node.children) {
                        let phraseN = node.children[i];
                        console.log(phraseN.tagName);
                        if (phraseN.tagName == 'phrase') {
                            item.value.push({'n': phraseN.getAttribute('n'), 'startid': phraseN.getAttribute('startid'), 'endid': phraseN.getAttribute('endid'), 'type': phraseN.getAttribute('type')})
                        }
                    }
                }
            }
        };

        return {
            phraseSegmentData,
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
