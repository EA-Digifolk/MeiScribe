<template>
    <div class="card" style="width: 50em;">
        <h4 class="card-header">
            Source Statement Form
        </h4>
        <div class="card-body container">
            <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5">
                <li class="row mb-1" v-for="item in titleStmtData">
                    <div class="col col-sm-2 card-text">
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
        const titleStmtData = ref([
            { name: 'id', tag: './/mei:titleStmt//mei:title[@type="main"]', value: '', on_display: 'ID', default: 'CO-YEAR-RE-SUB-NUM' },
            { name: 'title', tag: './/mei:titleStmt//mei:title', value: '', on_display: 'Title', default: '' },
            { name: 'subtitle', tag: './/mei:titleStmt//mei:title[@type="subtitle"]', value: '', on_display: 'Subtitle', default: '' },
            { name: 'composer', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="composer"]', value: '', on_display: 'Composer', default: '' },
            { name: 'compiler', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="compiler"]', value: '', on_display: 'Compiler', default: '' },
            { name: 'informer', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="informer"]', value: '', on_display: 'Informer', default: '' },
            { name: 'encoder', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="encoder"]', value: '', on_display: 'Encoder', default: '' },
            { name: 'editor', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="editor"]', value: '', on_display: 'Editor', default: '' },
            { name: 'geogName', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="informer"]//mei:geogName', value: '', on_display: 'Geography', default: '' },
        ]);

        onMounted(() => {
            console.log(`the component is now mounted.`);
            //console.log(props.MEIData);
            getInfoFromMEI();
        });

        const saveToMEI = () => {
            for (let i in titleStmtData.value) {
                let item = titleStmtData.value[i];
                let node = getXpathNode(props.MEIData, item.tag);

                if (!node) {
                    console.log('No node with tag: ' + item.tag);
                    if (item.name == 'id') {
                        let nodeT = getXpathNode(props.MEIData, titleStmtData.value[1].tag);
                        if (!nodeT.hasAttribute('type')) {
                            nodeT.setAttribute('type', "main");
                        }; node = nodeT;
                    } else if (item.name == 'subtitle') {
                        let nodeT = getXpathNode(props.MEIData, titleStmtData.value[1].tag);
                        let node = document.createElementNS('http://www.music-encoding.org/ns/mei','title');
                        node.setAttribute('type', 'subtitle');
                        nodeT.insertAdjacentElement("afterend", node);
                    } else if (item.name == 'geogName') {
                        console.log(props.MEIData);
                        let nodeR = getXpathNode(props.MEIData, titleStmtData.value[8].tag);
                        let node = document.createElementNS('http://www.music-encoding.org/ns/mei','geogName');
                        nodeR.append(node);
                    } else {
                        let nodeR = getXpathNode(props.MEIData, './/mei:titleStmt//mei:respStmt');
                        let node = document.createElementNS('http://www.music-encoding.org/ns/mei','persName');
                        node.setAttribute('role', item.name );
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

            for (let i in titleStmtData.value) {
                let item = titleStmtData.value[i];
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
            titleStmtData,
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
