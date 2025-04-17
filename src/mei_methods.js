// mei_methods.js

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

    ],
    'worklist': [

    ],
    'ambitus': [

    ],
    'rhythmPattern': [

    ],
    'segmentation': [

    ]
};

export const getXpathNode = (nodeP, xpath, returnAll = false) => {
    const result = nodeP.evaluate(xpath, nodeP, prefix => prefix === 'mei' ? 'http://www.music-encoding.org/ns/mei' : null, XPathResult.ANY_TYPE, null);
    if (returnAll)
        return result;
    return result.iterateNext();
};

/**
 * Create Nodes for Title Statement
 * @param {*} meiTree 
 * @returns 
 */
const createNodesTitleStmt = (meiTree) => {
    for (let i in MEICAMPS['titleStmt']) {
        let item = MEICAMPS['titleStmt'][i];

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
                getXpathNode(meiTree, './/mei:titleStmt//mei:respStmt').append(node);
            }
        }
    }
    return meiTree;
};

/**
 * 
 * @param {*} meiTree 
 * @param {*} data 
 */
const updateNodesTitleStmt = (meiTree, data) => {
    for (let item in data) {
        if (item.name in MEICAMPS['titleStmt'].map((e) => { return e.name })) {
            let node = getXpathNode(meiTree, item.tag);

            if (item.name == 'id') {
                node.setAttribute('xml:id', item.value.replace(/\s+/g, ' ').trim());
            } else if (item.name == 'informer') {
                let tempChildren = node.children[0]
                node.textContent = item.value.replace(/\s+/g, ' ').trim();
                node.append(tempChildren);
            } else {
                node.textContent = item.value.replace(/\s+/g, ' ').trim();
            };
        }
    }
    return meiTree;
};

const createNodesPublisher = (meiTree) => {
    for (let i in MEICAMPS['publisher']) {
        let item = MEICAMPS['publisher'][i];

        let node = getXpathNode(meiTree, item.tag);

        if (!node) {
            let nodeP = getXpathNode(meiTree, './/mei:pubStmt');
            let node = document.createElementNS('http://www.music-encoding.org/ns/mei', item.name);
            nodeP.append(node);
        }

        if (node) {
            node.textContent = item.default.replace(/\s+/g, ' ').trim();
        }
    }
    return meiTree;
};

const updateNodesPublisher = (meiTree, data) => {
    for (let item in data) {
        if (item.name in MEICAMPS['publisher'].map((e) => { return e.name })) {
            let node = getXpathNode(meiTree, item.tag);
            node.textContent = item.value.replace(/\s+/g, ' ').trim();
        }
    }
    return meiTree;
};


export const createNodesMethods = (meiTree, info = 'titleStmt') => {
    switch (info) {
        case 'titleStmt': return createNodesTitleStmt(meiTree);
        case 'publisher': return createNodesPublisher(meiTree);
    }
};

export const updateNodesMethods = (meiTree, data, info = 'titleStmt') => {
    switch (info) {
        case 'titleStmt': return updateNodesTitleStmt(meiTree, data);
        case 'publisher': return updateNodesPublisher(meiTree, data);
    }
};
