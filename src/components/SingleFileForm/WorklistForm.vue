<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="w-100">Worklist Form</h4>
            <button href="#" class="btn-save-mei btn btn-primary ml-1" @click="saveToMEI"
                title="Apply Information To MEI File" data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip"
                data-bs-placement="bottom" data-bs-html="true">Apply To MEI</button>
        </div>
        <div class="card-body container">
            <div>
                <div id="form" class="mt-1 mb-3 pt-0 pb-0 p-5">
                    <li class="row"
                        :class="{ 'w-100 mb-1': !['mode', 'tempo', 'genre', 'region', 'city'].includes(item.name) }"
                        v-for="item in worklistData">
                        <div class="w-100 row" v-if="item.name === 'key'">
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">
                                    {{ item.on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <select v-if="item.name == 'key'" class="w-100 p-1" type="text" v-model="item.value"
                                    :placeholder="item.default">
                                    <option
                                        v-for="k in ['Cb', 'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'E#', 'Fb', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B', 'B#']"
                                        :value="k">{{ k }}</option>
                                </select>
                            </div>
                            <button class="col col-sm-1 btn btn-primary p-0"
                                title="Apply and Automatic Key and Mode Detection Algorithm"
                                data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip" data-bs-placement="top"
                                data-bs-html="true" @click="calculateModeKey">Auto K/M</button>
                            <div class="col col-sm-1 card-text" style="text-align: right">
                                <p class="card-text" :title="worklistData[4].tooltip"
                                    data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip"
                                    data-bs-placement="top" data-bs-html="true">{{ worklistData[4].on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
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
                                <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">
                                    {{ item.on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <input class="w-100" type="text" list="meterList" v-model="item.value"
                                    :placeholder="item.default" />
                                <datalist id="meterList">
                                    <option v-for="k in ['Binary', 'Ternary', 'Free', 'Polyrhythmic']" :value="k">{{ k
                                        }}</option>
                                </datalist>
                            </div>
                            <button class="col col-sm-1 btn btn-primary p-0"
                                title="Apply and Automatic Meter and Tempo Detection Algorithm"
                                data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip" data-bs-placement="top"
                                data-bs-html="true" @click="calculateMeterTempo">Auto M/T</button>
                            <div class="col col-sm-1 card-text" style="text-align: right">
                                <p class="card-text" :title="worklistData[6].tooltip"
                                    data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip"
                                    data-bs-placement="top" data-bs-html="true">{{ worklistData[6].on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <input class="w-100" type="text" v-model="worklistData[6].value"
                                    :placeholder="worklistData[6].default" />
                            </div>
                        </div>

                        <div class="w-100 row" v-else-if="item.name === 'language'">
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{
                item.on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <input class="w-100" type="text" list="langList" v-model="item.value"
                                    :placeholder="item.default" />
                                <datalist id="langList">
                                    <option v-for="k in ['en', 'es', 'pt', 'it', 'cat']" :value="k">{{ k }}</option>
                                </datalist>
                            </div>
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="worklistData[9].tooltip"
                                    data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip"
                                    data-bs-placement="top" data-bs-html="true">{{ worklistData[9].on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <input class="w-100" type="text" list="genreList" v-model="worklistData[9].value"
                                    :placeholder="worklistData[9].default" />
                                <datalist id="genreList">
                                    <option v-for="k in ['Children Song', 'Work Song', 'Dance', 'Lullaby']" :value="k">
                                        {{ k }}</option>
                                </datalist>
                            </div>
                        </div>
                        <div class="w-100 row" v-else-if="item.name === 'country'">
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{
                item.on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <input class="w-100" type="text" list="countryList" v-model="item.value"
                                    :placeholder="item.default" @change="setDefaultLanguage" />
                                <datalist id="countryList">
                                    <option
                                        v-for="k in ['Brazil', 'Colombia', 'Ireland', 'Mexico', 'Portugal', 'Spain',]"
                                        :value="k">{{ k }}</option>
                                </datalist>
                            </div>
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="worklistData[11].tooltip"
                                    data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip"
                                    data-bs-placement="top" data-bs-html="true">{{ worklistData[11].on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <input class="w-100" type="text" v-model="worklistData[11].value"
                                    :placeholder="worklistData[11].default" />
                            </div>
                        </div>

                        <div class="w-100 row" v-else-if="item.name === 'district'">
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{
                item.on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <input class="w-100" type="text" v-model="item.value" :placeholder="item.default" />
                            </div>
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="worklistData[13].tooltip"
                                    data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip"
                                    data-bs-placement="top" data-bs-html="true">{{ worklistData[13].on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text">
                                <input class="w-100" type="text" v-model="worklistData[13].value"
                                    :placeholder="worklistData[13].default" />
                            </div>
                        </div>

                        <div class="w-0" v-else-if="['mode', 'tempo', 'genre', 'region', 'city'].includes(item.name)">
                        </div>

                        <div class="w-100 row" v-else-if="['notes', 'lyrics'].includes(item.name)">
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{
                item.on_display }}</p>
                            </div>
                            <div class="col col-sm-10 card-text">
                                <textarea class="w-100 p-1 mb-0" type="text" v-model="item.value"
                                    :placeholder="item.default"></textarea>
                            </div> <!--TODO: Check why text area leaving space under-->
                        </div>
                        <div class="w-100 row" v-else-if="item.name == 'vocal topics'">
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{
                item.on_display }}</p>
                            </div>
                            <div class="col col-sm-8 card-text">
                                <input class="w-100 p-1" type="text" v-model="item.value" :placeholder="item.default" />
                            </div>
                            <button class="col col-sm-2 btn btn-primary p-0"
                                title="Apply Automatic Function to get Vocal Topics"
                                data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip" data-bs-placement="top"
                                data-bs-html="true" @click="calculateVocalTopics">Auto Vocal Topics</button>
                        </div>
                        <div class="w-100 row" v-else>
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{
                item.on_display }}</p>
                            </div>
                            <div class="col col-sm-10 card-text">
                                <input class="w-100 p-1" type="text" v-model="item.value" :placeholder="item.default" />
                            </div>
                        </div>
                    </li>
                </div>
            </div>
        </div>
        <button class="btn-show-score btn btn-primary mb-3" @click="showScore = !showScore">Show Score</button>
        <MusicalScore id="WorkListForm" :vT="vT" :meiTree="MEIData" v-if="showScore" />
        <Teleport to="body">
            <modal :show="showModal" @close="showModal = false">
                <template #header>
                    <h3>Saved Worklist to MEI File</h3>
                </template>
                <template #body>
                    <pre class="w-100" id="MEI-Modal-Worklist">{{ WorklistOntMEI }}</pre>
                </template>
            </modal>
        </Teleport>
    </div>
</template>

<script type="module">
import { Tooltip } from 'bootstrap';
import Modal from '../Modal.vue';
import MusicalScore from '../MusicalScore.vue';

export default {
    inject: ['getXpathNode', 'prettifyXml', 'capitalizeFirstLetter',
        'createNodesMethods', 'updateNodesMethods',
        'getAutomaticModeKey', 'getAutomaticMeterTempo', 'getAutomaticVocalTopics'],
    components: {
        MusicalScore,
        Tooltip,
        Modal
    },
    props: ['MEIData', 'vT', 'export'],
    emits: ["saveFinished"],
    data() {
        return {
            worklistData: [
                { name: 'title', tag: './/mei:workList//mei:title', value: '', on_display: 'Title', default: '', tooltip: 'title of song' },
                { name: 'author', tag: './/mei:workList//mei:author', value: '', on_display: 'Author', default: '', tooltip: 'author/informant of song' },
                { name: 'lyrics', tag: './/mei:workList//mei:head', value: '', on_display: 'Lyrics', default: '', tooltip: 'complete lyrics of song' },
                { name: 'key', tag: './/mei:workList//mei:key', value: '', on_display: 'Key', default: 'C', automatic: false, tooltip: 'key of song (e.g., C, E Flat)' },
                { name: 'mode', tag: './/mei:workList//mei:key', value: '', on_display: 'Mode', default: 'Major', automatic: false, tooltip: 'mode of song (e.g., Major, Minor)' },
                { name: 'meter', tag: './/mei:workList//mei:meter', value: '', on_display: 'Meter', default: 'Binary', automatic: false, tooltip: 'meter of song [enum: Binary, Ternary, Free, Polyrhythmic]' },
                { name: 'tempo', tag: './/mei:workList//mei:tempo', value: '', on_display: 'Tempo', default: '', automatic: false, tooltip: 'tempo indication of song (e.g., Allegro)' },
                { name: 'language', tag: './/mei:workList//mei:langUsage//mei:language', value: '', on_display: 'Language', default: 'en', tooltip: 'language of lyrics' },
                { name: 'notes', tag: './/mei:workList//mei:annot', value: '', on_display: 'Notes', default: '', tooltip: 'optional annotations' },
                { name: 'genre', tag: './/mei:workList//mei:term[@type="genre"]', value: '', on_display: 'Genre', default: 'Dance', tooltip: 'genre of song (e.g., Children Song, Work Song, Dance, Lullaby)' },
                { name: 'country', tag: './/mei:workList//mei:term[@type="country"]', value: '', on_display: 'Country', default: 'Ireland', tooltip: 'country from where the song came' },
                { name: 'region', tag: './/mei:workList//mei:term[@type="region"]', value: '', on_display: 'Region', default: '', tooltip: 'region of the country from where the song came' },
                { name: 'district', tag: './/mei:workList//mei:term[@type="district"]', value: '', on_display: 'District', default: '', tooltip: 'district of the region from where the song came' },
                { name: 'city', tag: './/mei:workList//mei:term[@type="city"]', value: '', on_display: 'City', default: '', tooltip: 'city of the district from where the song came' },
                { name: 'vocal topics', tag: './/mei:workList//mei:keywords', value: '', n_gram: '', bi_gram: '', on_display: 'Topics', default: '', automatic: false, tooltip: 'extracted topics for the song' },
            ],
            showScore: false,
            showModal: false,
            WorklistOntMEI: ''
        }
    },
    watch: {
        export: function (newVal, oldVal) {
            if (newVal != oldVal) {
                this.saveToMEI(false);
            }
        }
    },
    mounted() {
        this.getInfoFromMEI();
        const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            new Tooltip(tooltipTriggerEl, {
                customClass: 'custom-tooltip',
                animated: 'fade',
                placement: 'bottom',
                trigger: 'hover'
            });
        });
    },
    methods: {
        setDefaultLanguage(event) {
            switch (event.target.value) {
                case 'Portugal':
                    this.worklistData[7].value = 'pt';
                    break;
                case 'Colombia':
                case 'Mexico':
                case 'Spain':
                    this.worklistData[7].value = 'es';
                    break;
                case 'Italy':
                    this.worklistData[7].value = 'it';
                    break;
                default:
                    this.worklistData[7].value = 'en';
                    break;
            }
        },
        calculateModeKey() {
            let [key, mode, score] = this.getAutomaticModeKey(this.vT, this.MEIData);

            this.worklistData[3].value = key;
            this.worklistData[3].default = key;
            this.worklistData[3].automatic = true;
            this.worklistData[3].confidence = score;

            this.worklistData[4].value = mode;
            this.worklistData[4].default = mode;
            this.worklistData[4].automatic = true;
            this.worklistData[4].confidence = score;
        },
        calculateMeterTempo() {
            let [meter, tempo] = this.getAutomaticMeterTempo(this.MEIData);

            this.worklistData[5].value = meter;
            this.worklistData[5].default = meter;
            this.worklistData[5].automatic = true;

            this.worklistData[6].value = "Lento";//tempo;
            this.worklistData[6].default = "Lento";//tempo;
            this.worklistData[6].automatic = true;
        },
        calculateVocalTopics() {
            let [lyrics, topics] = this.getAutomaticVocalTopics(this.MEIData);
        },
        saveToMEI(openModal = true) {
            let workListNode = this.getXpathNode(this.MEIData, './/mei:work');

            if (!workListNode) {
                this.createNodesMethods(this.MEIData, 'worklist');
            };
            this.updateNodesMethods(this.MEIData, this.worklistData, 'worklist');

            this.WorklistOntMEI = this.prettifyXml(new XMLSerializer().serializeToString(this.getXpathNode(this.MEIData, './/mei:work')));

            if (openModal) {
                this.showModal = !this.showModal;
            } else {
                this.$emit("saveFinished", "WorklistForm");
            }
        },
        getInfoFromMEI() {
            this.worklistData.forEach(item => {
                let node = this.getXpathNode(this.MEIData, item.tag);
                if (node) {
                    if (item.name == 'id') {
                        item.value = node.getAttribute('xml:id').replace(/\s+/g, ' ').trim();
                    } else if (item.name == 'mode') {
                        let mode = node.getAttribute('mode');
                        if (mode) {
                            item.value = this.capitalizeFirstLetter(mode).replace(/\s+/g, ' ').trim();
                        }
                    } else if (item.name == 'language') {
                        let lang = node.getAttribute('xml:lang');
                        if (lang) {
                            item.value = lang.replace(/\s+/g, ' ').trim();
                        }
                    } else if (item.name === 'lyrics' || item.name === 'notes' || item.name === 'key') {
                        item.value = node.textContent;
                    } else {
                        item.value = this.capitalizeFirstLetter(node.textContent).replace(/\s+/g, ' ').trim();
                    }
                }
            });
        }
    }
};
</script>

<style scoped>
#MEI-Modal-Worklist {
    max-height: 80% !important;
}
</style>
