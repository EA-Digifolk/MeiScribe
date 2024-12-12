<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Source Statement Form</h4> <button href="#" class="btn-save-mei btn btn-primary ml-1"
                @click="saveToMEI">Apply To MEI</button>
        </div>
        <div class="card-body container">
            <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5">
                <li class="row mb-1" v-for="item in sourceStmtData">
                    <div class="col col-sm-3 card-text" style="text-align: right">
                        <p class="card-text">{{ item.on_display }}</p>
                    </div>
                    <div class="col col-sm-9 card-text"> <input class="w-100 p-1" :type="item.type"
                            v-model="item.value" :placeholder="item.default" /> </div>
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

        const sourceStmtData = ref([
            { name: 'id', tag: './/mei:source', value: '', on_display: 'ID', default: 'CO-YEAR-RE-SUB', type: 'text', tooltip: `` },
            { name: 'title', tag: './/mei:source//mei:title', value: '', on_display: 'Title', default: '', type: 'text', tooltip: `` },
            { name: 'subtitle', tag: './/mei:source//mei:title[@type="subordinate"]', value: '', on_display: 'Subtitle', default: '', type: 'text', tooltip: `` },
            { name: 'compiler', tag: './/mei:source//mei:respStmt//mei:persName[@role="compiler"]', value: '', on_display: 'Compiler', default: '', type: 'text', tooltip: `` },
            { name: 'collaborator', tag: './/mei:source//mei:respStmt//mei:persName[@role="collaborator"]', value: '', on_display: 'Collaborator', default: '', type: 'text', tooltip: `` },
            { name: 'bibliography', tag: './/mei:source//mei:respStmt//mei:persName[@role="bibliography"]', value: '', on_display: 'Bibliography', default: '', type: 'text', tooltip: `` },
            { name: 'introduction', tag: './/mei:source//mei:respStmt//mei:persName[@role="introduction"]', value: '', on_display: 'Introduction', default: '', type: 'text', tooltip: `` },
            { name: 'edition', tag: './/mei:source//mei:imprint//mei:respStmt//mei:persName[@role="edition"]', value: '', on_display: 'Edition', default: '', type: 'text', tooltip: `` },
            { name: 'publisher', tag: './/mei:source//mei:publisher', value: '', on_display: 'Publisher', default: '', type: 'text', tooltip: `` },
            { name: 'place', tag: './/mei:source//mei:pubPlace', value: '', on_display: 'Publication Place', default: '', type: 'text', tooltip: `` },
            { name: 'date', tag: './/mei:source//mei:date', value: '', on_display: 'Publication Date', default: 2024, type: 'number', tooltip: `` },
            { name: 'pages', tag: './/mei:source//mei:extent[@type="pages"]', value: '', on_display: 'Number of Pages', default: 0, type: 'number', tooltip: `` },
        ]);

        onMounted(() => {
            getInfoFromMEI();
        });

        const saveToMEI = () => {

            let imprintNode = getXpathNode(props.MEIData, './/mei:source//mei:imprint');
            if (!imprintNode) {
                let node = getXpathNode(props.MEIData, './/mei:fileDesc');
                
                const entriesN = ['sourceDesc', 'source', 'biblStruct', 'monogr', 'imprint'];
                for (let key in entriesN) {
                    let temp_node = document.createElementNS('http://www.music-encoding.org/ns/mei', entriesN[key]);
                    node.append(temp_node);
                    node = temp_node;
                }

                imprintNode = node;
            } 
            
            
            for (let i in sourceStmtData.value) {
                let item = sourceStmtData.value[i];
                let node = getXpathNode(props.MEIData, item.tag);

                if (!node) {
                    //console.log('No node with tag: ' + item.tag);
                    if (item.name === 'subtitle') {
                        let node = document.createElementNS('http://www.music-encoding.org/ns/mei', 'title');
                        node.setAttribute('type', 'subordinate');
                        imprintNode.append(node);
                    } else if (['compiler', 'collaborator', 'bibliography', 'introduction', 'edition'].includes(item.name)) {
                        let nodeR = getXpathNode(props.MEIData, './/mei:source//mei:respStmt');
                        if (!nodeR) {
                            nodeR = document.createElementNS('http://www.music-encoding.org/ns/mei', 'respStmt');
                            imprintNode.append(nodeR);
                        }
                        let node = document.createElementNS('http://www.music-encoding.org/ns/mei', 'persName');
                        node.setAttribute('role', item.name);
                        nodeR.append(node);
                    } else if (item.name === 'place') {
                        let node = document.createElementNS('http://www.music-encoding.org/ns/mei', 'pubPlace');
                        imprintNode.append(node);
                    } else if (item.name === 'pages') {
                        let node = document.createElementNS('http://www.music-encoding.org/ns/mei', 'extent');
                        node.setAttribute('type', 'pages');
                        imprintNode.append(node);
                    } else {
                        let node = document.createElementNS('http://www.music-encoding.org/ns/mei', item.name);
                        imprintNode.append(node);
                    }
                }

                if (node) {
                    if (item.name == 'id') {
                        node.setAttribute('xml:id', item.value.replace(/\s+/g, ' ').trim());
                    } else {
                        node.textContent = item.value.replace(/\s+/g, ' ').trim();
                    }
                }
            };
        };

        const getXpathNode = (nodeP, xpath) => {
            const result = nodeP.evaluate(xpath, nodeP, prefix => prefix === 'mei' ? 'http://www.music-encoding.org/ns/mei' : null, XPathResult.ANY_TYPE, null);
            return result.iterateNext();
        }

        const getInfoFromMEI = () => {

            for (let i in sourceStmtData.value) {
                let item = sourceStmtData.value[i];
                let node = getXpathNode(props.MEIData, item.tag);
                if (node) {
                    if (item.name === 'id') {
                        item.value = node.getAttribute('xml:id')
                    } else if (item.name === 'date' || item.name === 'pages') {
                        item.value = parseInt(node.textContent.replace(/\s+/g, ' ').trim());
                    } else {
                        item.value = node.textContent.replace(/\s+/g, ' ').trim();
                    }
                }
            }
        };

        return {
            sourceStmtData,
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
