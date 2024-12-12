<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Title Statement Form</h4> <button href="#" class="btn-save-mei btn btn-primary ml-1"
                @click="saveToMEI" data-tooltip="Apply Information To MEI File">Apply To MEI</button>
        </div>
        <div class="card-body container">
            <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5">
                <li class="row mb-1" v-for="item in titleStmtData">
                    <div class="col col-sm-2 card-text" style="text-align: right" :data-tooltip="item.tooltip">
                        <p class="card-text">{{ item.on_display }}</p>
                    </div>
                    <div class="col col-sm-10 card-text"> <input class="w-100 p-1" type="text" v-model="item.value"
                            :placeholder="item.default" /> </div>
                </li>
            </div>
        </div>
        <Teleport to="body">
            <!-- use the modal component, pass in the prop -->
            <modal :show="showModal" @close="showModal = false">
                <template #header>
                    <h3>Saved Title Statement to MEI File</h3>
                </template>
                <template #body>
                    <pre class="w-100" id="MEI-Modal-TitleStmt">{{ TitleStmOntMEI }}</pre>
                </template>
            </modal>
        </Teleport>
    </div>

</template>

<script>
import { ref } from 'vue';
import { onMounted } from 'vue';

import Modal from './Modal.vue';

export default {
    components: {
        Modal
    },
    props: ['MEIData'],
    setup(props) {
        const titleStmtData = ref([
            { name: 'id', tag: './/mei:titleStmt//mei:title[@type="main"]', value: '', on_display: 'ID', default: 'CO-YEAR-RE-SUB-NUM', tooltip: 'XPTO'},
            { name: 'title', tag: './/mei:titleStmt//mei:title', value: '', on_display: 'Title', default: '', tooltip: '' },
            { name: 'subtitle', tag: './/mei:titleStmt//mei:title[@type="subtitle"]', value: '', on_display: 'Subtitle', default: '', tooltip: '' },
            { name: 'composer', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="composer"]', value: '', on_display: 'Composer', default: '', tooltip: '' },
            { name: 'compiler', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="compiler"]', value: '', on_display: 'Compiler', default: '', tooltip: '' },
            { name: 'informer', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="informer"]', value: '', on_display: 'Informer', default: '', tooltip: '' },
            { name: 'encoder', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="encoder"]', value: '', on_display: 'Encoder', default: '', tooltip: '' },
            { name: 'editor', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="editor"]', value: '', on_display: 'Editor', default: '', tooltip: '' },
            { name: 'geogName', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="informer"]//mei:geogName', value: '', on_display: 'Geography', default: '', tooltip: '' },
        ]);
        const showModal = ref(false);
        const TitleStmOntMEI = ref('');

        onMounted(() => {
            getInfoFromMEI();
        });

        const saveToMEI = () => {
            for (let i in titleStmtData.value) {
                let item = titleStmtData.value[i];
                let node = getXpathNode(props.MEIData, item.tag);

                if (!node) {
                    //console.log('No node with tag: ' + item.tag);
                    if (item.name == 'id') {
                        let nodeT = getXpathNode(props.MEIData, titleStmtData.value[1].tag);
                        if (!nodeT.hasAttribute('type')) {
                            nodeT.setAttribute('type', "main");
                        }; node = nodeT;
                    } else if (item.name == 'subtitle') {
                        let node = document.createElementNS('http://www.music-encoding.org/ns/mei', 'title');
                        node.setAttribute('type', 'subtitle');
                        getXpathNode(props.MEIData, titleStmtData.value[1].tag).insertAdjacentElement("afterend", node);
                    } else if (item.name == 'geogName') {
                        let node = document.createElementNS('http://www.music-encoding.org/ns/mei', 'geogName');
                        getXpathNode(props.MEIData, titleStmtData.value[8].tag).append(node);
                    } else {
                        let node = document.createElementNS('http://www.music-encoding.org/ns/mei', 'persName');
                        node.setAttribute('role', item.name);
                        getXpathNode(props.MEIData, './/mei:titleStmt//mei:respStmt').append(node);
                    }
                };
                if (node) {
                    if (item.name == 'id') {
                        node.setAttribute('xml:id', item.value.replace(/\s+/g,' ').trim());
                    } else if (item.name == 'informer') {
                        let tempChildren = node.children[0]
                        node.textContent = item.value.replace(/\s+/g,' ').trim();
                        node.append(tempChildren);
                    } else {
                        node.textContent = item.value.replace(/\s+/g,' ').trim();
                    };
                };
            };

            TitleStmOntMEI.value = prettifyXml(new XMLSerializer().serializeToString(getXpathNode(props.MEIData, './/mei:titleStmt')));
            showModal.value = !showModal.value;
        };

        const prettifyXml = (sourceXml) => {
            var xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
            var xsltDoc = new DOMParser().parseFromString([
                // describes how we want to modify the XML - indent everything
                '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
                '  <xsl:strip-space elements="*"/>',
                '  <xsl:template match="para[content-style][not(text())]">', // change to just text() to strip space in text nodes
                '    <xsl:value-of select="normalize-space(.)"/>',
                '  </xsl:template>',
                '  <xsl:template match="node()|@*">',
                '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
                '  </xsl:template>',
                '  <xsl:output indent="yes"/>',
                '</xsl:stylesheet>',
            ].join('\n'), 'application/xml');

            var xsltProcessor = new XSLTProcessor();
            xsltProcessor.importStylesheet(xsltDoc);
            var resultDoc = xsltProcessor.transformToDocument(xmlDoc);
            var resultXml = new XMLSerializer().serializeToString(resultDoc);
            return resultXml;
        };

        const getXpathNode = (nodeP, xpath) => {
            const result = nodeP.evaluate(xpath, nodeP, prefix => prefix === 'mei' ? 'http://www.music-encoding.org/ns/mei' : null, XPathResult.ANY_TYPE, null);
            return result.iterateNext();
        };

        const getInfoFromMEI = () => {
            for (let i in titleStmtData.value) {
                let item = titleStmtData.value[i];
                let node = getXpathNode(props.MEIData, item.tag);
                if (node) {
                    if (item.name == 'id') {
                        item.value = node.getAttribute('xml:id').replace(/\s+/g,' ').trim();
                    } else {
                        item.value = node.textContent.replace(/\s+/g,' ').trim();
                    }
                }
            }
        };

        return {
            showModal,
            titleStmtData,
            TitleStmOntMEI,
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

#MEI-Modal-TitleStmt {
    max-height: 80% !important;
}

[data-tooltip]::before {
    /* needed - do not touch */
    content: attr(data-tooltip);
    position: absolute;
    opacity: 0;

    /* customizable */
    transition: all 0.15s ease;
    padding: 10px;
    color: #333;
    border-radius: 10px;
    box-shadow: 2px 2px 1px silver;
}

[data-tooltip]:hover::before {
    /* needed - do not touch */
    opacity: 1;

    /* customizable */
    background: lightblue;
    margin-top: 1em;
    margin-left: -8em;
}

[data-tooltip]:not([data-tooltip-persistent])::before {
    pointer-events: none;
}
</style>
