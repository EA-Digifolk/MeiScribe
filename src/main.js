import { createApp } from 'vue';

import App from './App.vue';

import './style.css';
import "bootstrap/dist/css/bootstrap.css";
import SvgIcon from "vue3-icon";

import { getXpathNode, createNodesMethods, updateNodesMethods } from './extra_methods/mei_methods.js';
import { getAutomaticAmbitus, getAutomaticMeterTempo, getAutomaticRhythmPattern, getAutomaticSegmentation } from './extra_methods/automatic_functions.js';
import { getAutomaticModeKey } from './extra_methods/key_mode_detection.js'

const app = createApp(App)

app.component("svg-icon", SvgIcon);

app.provide('prettifyXml', (sourceXml) => {
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
});

app.provide('capitalizeFirstLetter', (string) => {
    return string && (string[0].toUpperCase() + string.slice(1));
});

app.provide('getXpathNode', getXpathNode);
app.provide('createNodesMethods', createNodesMethods);
app.provide('updateNodesMethods', updateNodesMethods);

app.provide('getAutomaticAmbitus', getAutomaticAmbitus);

app.provide('getAutomaticMeterTempo', getAutomaticMeterTempo);
app.provide('getAutomaticRhythmPattern', getAutomaticRhythmPattern);
app.provide('getAutomaticSegmentation', getAutomaticSegmentation);

app.provide('getAutomaticModeKey', getAutomaticModeKey);


app.provide(/* key */ 'message', /* value */ 'hello!')

app.mount('#app');

import "bootstrap/dist/js/bootstrap.js";
