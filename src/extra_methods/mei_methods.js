// mei_methods.js

import * as music21 from 'music21j';

const MEICAMPS = {
    'titleStmt': [
        { name: 'id', tag: './/mei:titleStmt//mei:title[@type="main"]' },
        { name: 'title', tag: './/mei:titleStmt//mei:title[@type="main"]' },
        { name: 'subtitle', tag: './/mei:titleStmt//mei:title[@type="subtitle"]' },
        { name: 'composer', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="composer"]' },
        { name: 'compiler', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="compiler"]' },
        { name: 'informer', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="informer"]' },
        { name: 'encoder', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="encoder"]' },
        { name: 'editor', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="editor"]' },
        { name: 'geogName', tag: './/mei:titleStmt//mei:respStmt//mei:persName[@role="informer"]//mei:geogName' },
    ],
    'publisher': [
        { name: 'publisher', tag: './/mei:pubStmt//mei:publisher', default: 'EA-Digifolk Reseach Project' },
        { name: 'date', tag: './/mei:pubStmt//mei:date', default: '2025' },
        { name: 'availability', tag: './/mei:pubStmt//mei:availability', default: `To the best of our knowledge, the full compositions on this site are in the public domain, the excerpts are in the public domain or are allowable under fair-use, and the few compositions that are still under copyright are used by permission. These scores, are provided for educational use only and are not to be used commercially.` },
    ],
    'sourceStmt': [
        { name: 'id', tag: './/mei:source' },
        { name: 'title', tag: './/mei:source//mei:title' },
        { name: 'subtitle', tag: './/mei:source//mei:title[@type="subordinate"]' },
        { name: 'compiler', tag: './/mei:source//mei:respStmt//mei:persName[@role="compiler"]' },
        { name: 'collaborator', tag: './/mei:source//mei:respStmt//mei:persName[@role="collaborator"]' },
        { name: 'bibliography', tag: './/mei:source//mei:respStmt//mei:persName[@role="bibliography"]' },
        { name: 'introduction', tag: './/mei:source//mei:respStmt//mei:persName[@role="introduction"]' },
        { name: 'edition', tag: './/mei:source//mei:imprint//mei:respStmt//mei:persName[@role="edition"]' },
        { name: 'publisher', tag: './/mei:source//mei:publisher' },
        { name: 'place', tag: './/mei:source//mei:pubPlace' },
        { name: 'date', tag: './/mei:source//mei:date' },
        { name: 'pages', tag: './/mei:source//mei:extent[@type="pages"]' },
    ],
    'worklist': [
        { name: 'title', tag: './/mei:workList//mei:title' },
        { name: 'author', tag: './/mei:workList//mei:author' },
        { name: 'lyrics', tag: './/mei:workList//mei:head' },
        { name: 'key', tag: './/mei:workList//mei:key' },
        { name: 'mode', tag: './/mei:workList//mei:key' },
        { name: 'meter', tag: './/mei:workList//mei:meter' },
        { name: 'tempo', tag: './/mei:workList//mei:tempo' },
        { name: 'language', tag: './/mei:workList//mei:langUsage//mei:language' },
        { name: 'notes', tag: './/mei:workList//mei:annot' },
        { name: 'genre', tag: './/mei:workList//mei:term[@type="genre"]' },
        { name: 'country', tag: './/mei:workList//mei:term[@type="country"]' },
        { name: 'region', tag: './/mei:workList//mei:term[@type="region"]' },
        { name: 'district', tag: './/mei:workList//mei:term[@type="district"]' },
        { name: 'city', tag: './/mei:workList//mei:term[@type="city"]' },
    ],
    'ambitus': [
        { name: 'lowest', tag: './/mei:ambNote[@type="lowest"]' },
        { name: 'highest', tag: './/mei:ambNote[@type="highest"]' },
    ],
    'structuralPatterns': [
        { name: 'melodic pattern', tag: './/mei:supplied[@type="melodic pattern"]' },
        { name: 'interval pattern', tag: './/mei:supplied[@type="interval pattern"]' },
        { name: 'rhythm pattern', tag: './/mei:supplied[@type="rhythm pattern"]' },
    ],
    'segmentation': [
        { name: 'phrases', tag: './/mei:music//mei:section//mei:supplied[@type="phrases"]' },
    ]
};

export const getXpathNode = (nodeP, xpath, returnAll = false) => {
    const result = nodeP.evaluate(xpath, nodeP, prefix => prefix === 'mei' ? 'http://www.music-encoding.org/ns/mei' : null, XPathResult.ANY_TYPE, null);
    if (returnAll)
        return result;
    return result.iterateNext();
};

export const getMusicalIncipMeasure = (meas) => {
    let docM = document.createElementNS('http://www.music-encoding.org/ns/mei', 'measure');
    docM.setAttribute('copyof', '#' + meas.getAttribute('xml:id'));
    return docM;
};

/**
 * Create Nodes for Title Statement
 * @param {*} meiTree 
 * @returns 
 */
const createNodesTitleStmt = (meiTree) => {
    MEICAMPS['titleStmt'].forEach(item => {
        let node = getXpathNode(meiTree, item.tag);
        if (!node) {
            if (item.name == 'id' || item.name == 'title') {
                let nodeT = getXpathNode(meiTree, './/mei:titleStmt//mei:title');
                if (!nodeT.hasAttribute('type')) {
                    nodeT.setAttribute('type', "main");
                }; node = nodeT;
            } else if (item.name == 'subtitle') {
                node = document.createElementNS('http://www.music-encoding.org/ns/mei', 'title');
                node.setAttribute('type', 'subtitle');
                getXpathNode(meiTree, MEICAMPS['titleStmt'][1].tag).insertAdjacentElement("afterend", node);
            } else if (item.name == 'geogName') {
                node = document.createElementNS('http://www.music-encoding.org/ns/mei', 'geogName');
                getXpathNode(meiTree, MEICAMPS['titleStmt'][5].tag).append(node);
            } else {
                node = document.createElementNS('http://www.music-encoding.org/ns/mei', 'persName');
                node.setAttribute('role', item.name);
                try {
                    getXpathNode(meiTree, './/mei:titleStmt//mei:respStmt').append(node);
                } catch (error) {
                    let nodeRespStmt = document.createElementNS('http://www.music-encoding.org/ns/mei', 'respStmt');
                    nodeRespStmt.append(node);
                    getXpathNode(meiTree, './/mei:titleStmt').append(nodeRespStmt);
                }

            }
        }
    });
    return meiTree;
};

/**
 * Create Nodes for Publisher Statement
 * @param {*} meiTree 
 * @returns 
 */
const createNodesPublisher = (meiTree) => {
    MEICAMPS['publisher'].forEach(item => {
        let node = getXpathNode(meiTree, item.tag);
        if (!node) {
            node = document.createElementNS('http://www.music-encoding.org/ns/mei', item.name);
            getXpathNode(meiTree, './/mei:pubStmt').append(node);
        }
        node.textContent = item.default.replace(/\s+/g, ' ').trim();
    });
    return meiTree;
};


/**
 * Create Nodes for Source Statement
 * @param {*} meiTree 
 * @returns 
 */
const createNodesSourceStmt = (meiTree) => {
    let imprintNode = getXpathNode(meiTree, './/mei:source//mei:imprint');
    if (!imprintNode) {
        let node = getXpathNode(meiTree, './/mei:fileDesc');
        const entriesN = ['sourceDesc', 'source', 'biblStruct', 'monogr', 'imprint'];
        for (let key in entriesN) {
            let temp_node = document.createElementNS('http://www.music-encoding.org/ns/mei', entriesN[key]);
            node.append(temp_node);
            node = temp_node;
        }
        imprintNode = node;
    }
    MEICAMPS['sourceStmt'].forEach(item => {
        let node = getXpathNode(meiTree, item.tag);
        if (!node) {
            if (item.name === 'subtitle') {
                let node = document.createElementNS('http://www.music-encoding.org/ns/mei', 'title');
                node.setAttribute('type', 'subordinate');
                imprintNode.append(node);
            } else if (['compiler', 'collaborator', 'bibliography', 'introduction', 'edition'].includes(item.name)) {
                let nodeR = getXpathNode(meiTree, './/mei:source//mei:respStmt');
                if (!nodeR) {
                    nodeR = document.createElementNS('http://www.music-encoding.org/ns/mei', 'respStmt');
                    imprintNode.append(nodeR);
                };
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
    });
    return meiTree;
};

/**
 * Create Nodes for Worklist
 * @param {*} meiTree 
 * @returns 
 */
const createNodesWorklist = (meiTree) => {
    let workListNode = getXpathNode(meiTree, './/mei:work');
    if (!workListNode) {
        let node = getXpathNode(meiTree, './/mei:meiHead');
        const entriesN = ['workList', 'work'];
        for (let key in entriesN) {
            let temp_node = document.createElementNS('http://www.music-encoding.org/ns/mei', entriesN[key]);
            node.append(temp_node);
            node = temp_node;
        }
        workListNode = node;
    };
    MEICAMPS['worklist'].forEach(item => {
        let node = getXpathNode(meiTree, item.tag);
        if (!node) {
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
                let termlistNode = getXpathNode(meiTree, './/mei:workList//mei:classification//mei:termList');
                if (!termlistNode) {
                    let classificationNode = document.createElementNS('http://www.music-encoding.org/ns/mei', 'classification');
                    termlistNode = document.createElementNS('http://www.music-encoding.org/ns/mei', 'termList');
                    classificationNode.append(termlistNode);
                    workListNode.append(classificationNode);
                }
                node = document.createElementNS('http://www.music-encoding.org/ns/mei', 'term');
                node.setAttribute('type', item.name)
                termlistNode.append(node);
            } else {
                let node = document.createElementNS('http://www.music-encoding.org/ns/mei', item.name);
                workListNode.append(node);
            }
        };
    });

    let nodeMusical = getXpathNode(meiTree, './/mei:workList//mei:incip[@type="musical"]');
    if (!nodeMusical) {
        nodeMusical = document.createElementNS('http://www.music-encoding.org/ns/mei', 'incip');
        nodeMusical.setAttribute('type', 'musical');
        getXpathNode(meiTree, MEICAMPS['worklist'][6].tag).insertAdjacentElement("afterend", nodeMusical);
    } else {
        while (nodeMusical.firstChild) {
            nodeMusical.removeChild(nodeMusical.firstChild);
        }
    }

    let measures = getXpathNode(meiTree, './/mei:measure', true);
    let fM = measures.iterateNext();
    let sM = measures.iterateNext();
    nodeMusical.append(getMusicalIncipMeasure(fM));
    nodeMusical.append(getMusicalIncipMeasure(sM));

    return meiTree;
};

/**
 * Create Nodes for Ambitus
 * @param {*} meiTree 
 * @returns 
 */
const createNodesAmbitus = (meiTree) => {
    let ambitusNode = getXpathNode(meiTree, './/mei:ambitus');
    if (!ambitusNode) {
        let node = getXpathNode(meiTree, './/mei:scoreDef');

        const entriesN = ['ambitus'];
        for (let key in entriesN) {
            let temp_node = document.createElementNS('http://www.music-encoding.org/ns/mei', entriesN[key]);
            node.append(temp_node);
            node = temp_node;
        }
        ambitusNode = node;
    };
    MEICAMPS['ambitus'].forEach(item => {
        let node = getXpathNode(meiTree, item.tag);
        if (!node) {
            node = document.createElementNS('http://www.music-encoding.org/ns/mei', 'ambNote');
            node.setAttribute('type', item.name);
            ambitusNode.append(node);
        };
    });
    return meiTree;
};

/**
 * Create Nodes for Structural Patterns
 * @param {*} meiTree 
 * @returns 
 */
const createNodesPatterns = (meiTree) => {
    let rhythmPNode = getXpathNode(meiTree, './/mei:music//mei:section//mei:supplied[@type="rhythm pattern"]');
    if (!rhythmPNode) {
        rhythmPNode = document.createElementNS('http://www.music-encoding.org/ns/mei', 'supplied');
        rhythmPNode.setAttribute('type', 'rhythm pattern');
        getXpathNode(meiTree, './/mei:music//mei:section').insertAdjacentElement("afterbegin", rhythmPNode);
    };
    return meiTree;
};

/**
 * Create Nodes for Segmentation
 * @param {*} meiTree 
 * @returns 
 */
const createNodesSegmentation = (meiTree) => {
    let phraseNode = getXpathNode(meiTree, './/mei:music//mei:section//mei:supplied[@type="phrases"]');
    if (!phraseNode) {
        phraseNode = document.createElementNS('http://www.music-encoding.org/ns/mei', 'supplied');
        phraseNode.setAttribute('type', 'phrases');
    };
    let rhythmicSupplied = getXpathNode(meiTree, './/mei:music//mei:section//mei:supplied[@type="rhythm pattern"]');
    if (rhythmicSupplied) {
        rhythmicSupplied.insertAdjacentElement("afterend", phraseNode);
    } else {
        getXpathNode(meiTree, './/mei:music//mei:section').insertAdjacentElement("afterbegin", phraseNode);
    };
    return meiTree;
};


/**
 * Create Nodes for All Kinds of Info
 * @param {*} meiTree 
 * @param {*} info 
 * @returns 
 */
export const createNodesMethods = (meiTree, info = 'titleStmt') => {
    switch (info) {
        case 'titleStmt': return createNodesTitleStmt(meiTree);
        case 'publisher': return createNodesPublisher(meiTree);
        case 'sourceStmt': return createNodesSourceStmt(meiTree);
        case 'worklist': return createNodesWorklist(meiTree);
        case 'ambitus': return createNodesAmbitus(meiTree);
        case 'structuralPattern': return createNodesPatterns(meiTree);
        case 'segmentation': return createNodesSegmentation(meiTree);
    }
};

/**
 * Update TitleStatement with data
 * @param {*} meiTree 
 * @param {*} data 
 */
const updateNodesTitleStmt = (meiTree, data) => {
    data.forEach(item => {
        if (MEICAMPS['titleStmt'].map((e) => { return e.name }).includes(item.name)) {
            let node = getXpathNode(meiTree, item.tag);
            if (item.name === 'id') {
                node.setAttribute('xml:id', item.value.replace(/\s+/g, ' ').trim());
            } else if (item.name == 'informer') {
                let tempChildren = node.children[0]
                node.textContent = item.value.replace(/\s+/g, ' ').trim();
                node.append(tempChildren);
            } else {
                node.textContent = item.value.replace(/\s+/g, ' ').trim();
            };
        }
    });
    return meiTree;
};

/**
 * Update Publisher Statement with data
 * @param {*} meiTree 
 * @param {*} data 
 */
const updateNodesPublisher = (meiTree, data) => {
    data.forEach(item => {
        if (MEICAMPS['publisher'].map((e) => { return e.name }).includes(item.name)) {
            let node = getXpathNode(meiTree, item.tag);
            node.textContent = item.value.replace(/\s+/g, ' ').trim();
        }
    });
    return meiTree;
};

/**
 * Update Source Statement with data
 * @param {*} meiTree 
 * @param {*} data 
 * @returns
 */
const updateNodesSourceStmt = (meiTree, data) => {
    data.forEach(item => {
        if (MEICAMPS['sourceStmt'].map((e) => { return e.name }).includes(item.name)) {
            let node = getXpathNode(meiTree, item.tag);
            if (!item.value && item.default) {
                item.value = item.default;
            }
            if (item.name === 'id') {
                node.setAttribute('xml:id', item.value.replace(/\s+/g, ' ').trim());
            } else if (item.name === 'date' || item.name === 'pages') {
                node.textContent = item.value;
            } else {
                node.textContent = item.value.replace(/\s+/g, ' ').trim();
            }
        }
    });
    return meiTree;
};

/**
 * Update Worklist Statement with data
 * @param {*} meiTree 
 * @param {*} data 
 * @returns 
 */
const updateNodesWorklist = (meiTree, data) => {
    data.forEach(item => {
        if (MEICAMPS['worklist'].map((e) => { return e.name }).includes(item.name)) {
            let node = getXpathNode(meiTree, item.tag);

            if (!item.value && item.default) {
                item.value = item.default;
            }

            if (item.name == 'id') {
                node.setAttribute('xml:id', item.value.replace(/\s+/g, ' ').trim());
            } else if (item.name == 'mode') {
                node.setAttribute('mode', item.value.replace(/\s+/g, ' ').trim());
                node.setAttribute('automatic', item.automatic);
                if (item.automatic) {
                    node.setAttribute('confidence', item.confidence);
                }
            } else if (item.name == 'language') {
                node.setAttribute('xml:lang', item.value.replace(/\s+/g, ' ').trim());
            } else if (item.name === 'lyrics' || item.name === 'notes' || item.name === 'key') {
                node.textContent = item.value;
            } else {
                node.textContent = item.value.replace(/\s+/g, ' ').trim();
            }

        }
    });
    return meiTree;
};

/**
 * Update Ambitus with data
 * @param {*} meiTree 
 * @param {*} data 
 * @returns 
 */
const updateNodesAmbitus = (meiTree, data) => {
    data.forEach(item => {
        if (MEICAMPS['ambitus'].map((e) => { return e.name }).includes(item.name)) {
            let node = getXpathNode(meiTree, item.tag);
            const n = new music21.pitch.Pitch(item.value);
            node.setAttribute('pname', n.name.toLowerCase().replace(/\s+/g, ' ').trim());
            node.setAttribute('oct', n.octave);

            let automatic = true;
            if (item.value !== item.default) {
                automatic = false;
            };
            node.setAttribute('automatic', automatic);
        }
    });
    return meiTree;
};

/**
 * Update Structural Patterns with data
 * @param {*} meiTree 
 * @param {*} data 
 * @returns 
 */
const updateNodesPatterns = (meiTree, data) => {

    let rhythmPNode = getXpathNode(meiTree, data[0].tag);
    if (!rhythmPNode) {
        return meiTree;
    }

    if (rhythmPNode && rhythmPNode.children.length > 0) {
        rhythmPNode.replaceChildren();
    }

    let pattern = data[0].value.split(']');
    for (let i in pattern) {
        let pt = pattern[i].split('[');
        for (let j in pt) {
            if (/\d/.test(pt[j])) {
                let pt_s = pt[j].toString().split(" ");
                if (pt_s[0] == " ") {
                    pt_s = pt_s.slice(1);
                };

                let bT = rhythmPNode;
                if (pt[j][0] == 'b') {
                    bT = document.createElementNS('http://www.music-encoding.org/ns/mei', 'beam');
                    if (pt[j][1] != ' ') { bT.setAttribute('tuplet', pt[j][1]); }
                    rhythmPNode.append(bT);
                };

                for (let n in pt_s) {
                    if (/\d/.test(pt_s[n])) {
                        let note = document.createElementNS('http://www.music-encoding.org/ns/mei', 'note');
                        if (pt_s[n].includes('.')) {
                            let dots = pt_s[n].toString().split(".");
                            note.setAttribute('dur', parseInt(dots[0]));
                            note.setAttribute('dots', dots.length - 1);
                        } else {
                            note.setAttribute('dur', parseInt(pt_s[n]));
                        }
                        bT.append(note);
                    }
                };
            }
        }
    };

    return meiTree;
};

/**
 * Update Segmentation with data
 * @param {*} meiTree 
 * @param {*} data 
 * @returns 
 */
const updateNodesSegmentation = (meiTree, data) => {

    let phraseNode = getXpathNode(meiTree, data[0].tag);
    if (phraseNode.children.length > 0) {
        phraseNode.replaceChildren();
    };

    data[0].value.forEach(item => {
        let phEl = document.createElementNS('http://www.music-encoding.org/ns/mei', 'phrase');
        phEl.setAttribute('n', item.n);
        phEl.setAttribute('startid', '#' + item.startid);
        phEl.setAttribute('endid', '#' + item.endid);
        phEl.setAttribute('type', item.type);
        phraseNode.append(phEl);
    });
    return meiTree;
};

/**
 * Update Nodes for All Kinds of Info
 * @param {*} meiTree 
 * @param {*} data 
 * @param {*} info to update
 */
export const updateNodesMethods = (meiTree, data, info = 'titleStmt') => {
    switch (info) {
        case 'titleStmt': return updateNodesTitleStmt(meiTree, data);
        case 'publisher': return updateNodesPublisher(meiTree, data);
        case 'sourceStmt': return updateNodesSourceStmt(meiTree, data);
        case 'worklist': return updateNodesWorklist(meiTree, data);
        case 'ambitus': return updateNodesAmbitus(meiTree, data);
        case 'structuralPattern': return updateNodesPatterns(meiTree, data);
        case 'segmentation': return updateNodesSegmentation(meiTree, data);
    }
};

/**
 * Split an existing top-level <section> so it closes before the first <measure>,
 * then wrap measures outside <ending> into deterministic <section> blocks
 * for Verovio expansion maps. Keeps <ending> elements untouched but can optionally
 * rename them deterministically as ending-1, ending-2, ….
 *
 * @param {Document} meiTree - MEI XML DOM document (not a string)
 * @param {boolean} [renameEndings=false] - If true, rename <ending> xml:id attributes deterministically
 */
export const createExpansionsInMEI = (meiTree, renameEndings=false) => {
    const NS_MEI = "http://www.music-encoding.org/ns/mei";
    const score = meiTree.querySelector("score");
    if (!score) return;

    const originalSection = score.querySelector("section");
    if (!originalSection) return;

    // Rename original section
    originalSection.setAttribute("xml:id", "all");

    let sectionCounter = 1;
    let endingCounter = 1;
    const expansionPlist = [];

    // Step 1: Collect all children and clear original section
    const children = Array.from(originalSection.childNodes).filter(n => n.nodeType === 1);
    originalSection.innerHTML = "";

    let currentInnerSection = null;

    const appendInnerSection = () => {
        if (currentInnerSection && currentInnerSection.childNodes.length > 0) {
            originalSection.appendChild(currentInnerSection);
            expansionPlist.push(`#${currentInnerSection.getAttribute("xml:id")}`);
            currentInnerSection = null;
        }
    };

    // Step 2: Process children
    children.forEach(node => {
        if (node.tagName === "ending") {
            appendInnerSection();

            // Optionally rename endings
            if (renameEndings) {
                node.setAttribute("xml:id", `ending-${endingCounter++}`);
            } else {
                if (!node.hasAttribute("xml:id")) {
                    node.setAttribute("xml:id", `ending-${endingCounter++}`);
                }
            }

            originalSection.appendChild(node);
            expansionPlist.push(`#${node.getAttribute("xml:id")}`);
        } else if (node.tagName === "measure" || node.tagName === "pb" || node.tagName === "sb" || node.tagName === "repeat") {
            if (!currentInnerSection) {
                currentInnerSection = meiTree.createElementNS(NS_MEI, "section");
                currentInnerSection.setAttribute("xml:id", `section-${sectionCounter++}`);
            }
            currentInnerSection.appendChild(node);
        } else {
            // Other elements: append directly
            appendInnerSection();
            originalSection.appendChild(node);
        }
    });

    appendInnerSection();

    // Step 3: Create expansion element
    const expansion = meiTree.createElementNS(NS_MEI, "expansion");
    expansion.setAttribute("xml:id", "expansion-default");
    expansion.setAttribute("plist", expansionPlist.join(" "));

    // Step 4: Insert expansion before first inner section
    const firstInnerSection = originalSection.querySelector("section");
    if (firstInnerSection) {
        originalSection.insertBefore(expansion, firstInnerSection);
    } else {
        // Fallback: append at the end
        originalSection.appendChild(expansion);
    }

    return meiTree;
};
