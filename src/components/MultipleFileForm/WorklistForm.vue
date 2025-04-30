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
                            <div class="col col-sm-4 card-text align-self-center">
                                <select v-if="item.name == 'key'" class="input-text-sel p-1" type="text"
                                    v-model="item.value" :placeholder="item.default" :disabled="item.select === false">
                                    <option
                                        v-for="k in ['Cb', 'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'E#', 'Fb', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B', 'B#']"
                                        :value="k">{{ k }}</option>
                                </select>
                                <input class="input-check-sel p-1" type="checkbox" v-model="item.select"
                                    title="Edit Information" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" />
                            </div>
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="worklistData[2].tooltip"
                                    data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip"
                                    data-bs-placement="top" data-bs-html="true">{{ worklistData[2].on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text align-self-center">
                                <input class="input-text-sel" type="text" list="modesList"
                                    v-model="worklistData[2].value" :placeholder="worklistData[2].default"
                                    :disabled="worklistData[2].select === false" />
                                <datalist id="modesList">
                                    <option
                                        v-for="k in ['Major', 'Minor', 'Ionian', 'Dorian', 'Lydian', 'Phrygian', 'Mixolydian', 'Aeolian', 'Locrian']"
                                        :value="k">{{ k }}</option>
                                </datalist>
                                <input class="input-check-sel p-1" type="checkbox" v-model="worklistData[2].select"
                                    title="Edit Information" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" />
                            </div>
                        </div>

                        <div class="w-100 row" v-else-if="item.name === 'meter'">
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">
                                    {{ item.on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text align-self-center">
                                <input class="input-text-sel" type="text" list="meterList" v-model="item.value"
                                    :placeholder="item.default" :disabled="item.select === false" />
                                <datalist id="meterList">
                                    <option v-for="k in ['Binary', 'Ternary', 'Free', 'Polyrhythmic']" :value="k">{{ k
                                        }}</option>
                                </datalist>
                                <input class="input-check-sel p-1" type="checkbox" v-model="item.select"
                                    title="Edit Information" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" />
                            </div>
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="worklistData[4].tooltip"
                                    data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip"
                                    data-bs-placement="top" data-bs-html="true">{{ worklistData[4].on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text align-self-center">
                                <input class="input-text-sel" type="text" v-model="worklistData[4].value"
                                    :placeholder="worklistData[4].default"
                                    :disabled="worklistData[4].select === false" />
                                <input class="input-check-sel p-1" type="checkbox" v-model="worklistData[4].select"
                                    title="Edit Information" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" />
                            </div>
                        </div>

                        <div class="w-100 row" v-else-if="item.name === 'language'">
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{
                item.on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text align-self-center">
                                <input class="input-text-sel" type="text" list="langList" v-model="item.value"
                                    :placeholder="item.default" :disabled="item.select === false" />
                                <datalist id="langList">
                                    <option v-for="k in ['en', 'es', 'pt', 'it', 'cat']" :value="k">{{ k }}</option>
                                </datalist>
                                <input class="input-check-sel p-1" type="checkbox" v-model="item.select"
                                    title="Edit Information" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" />
                            </div>
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="worklistData[6].tooltip"
                                    data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip"
                                    data-bs-placement="top" data-bs-html="true">{{ worklistData[6].on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text align-self-center">
                                <input class="input-text-sel" type="text" list="genreList"
                                    v-model="worklistData[6].value" :placeholder="worklistData[6].default"
                                    :disabled="worklistData[6].select === false" />
                                <datalist id="genreList">
                                    <option v-for="k in ['Children Song', 'Work Song', 'Dance', 'Lullaby']" :value="k">
                                        {{ k }}</option>
                                </datalist>
                                <input class="input-check-sel p-1" type="checkbox" v-model="worklistData[6].select"
                                    title="Edit Information" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" />
                            </div>
                        </div>

                        <div class="w-100 row" v-else-if="item.name === 'country'">
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{
                item.on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text  align-self-center">
                                <input class="input-text-sel" type="text" list="countryList" v-model="item.value"
                                    :placeholder="item.default" :disabled="item.select === false" />
                                <datalist id="countryList">
                                    <option
                                        v-for="k in ['Brazil', 'Colombia', 'Ireland', 'Mexico', 'Portugal', 'Spain',]"
                                        :value="k">{{ k }}</option>
                                </datalist>
                                <input class="input-check-sel p-1" type="checkbox" v-model="item.select"
                                    title="Edit Information" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" />
                            </div>
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="worklistData[8].tooltip"
                                    data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip"
                                    data-bs-placement="top" data-bs-html="true">{{ worklistData[8].on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text align-self-center">
                                <input class="input-text-sel" type="text" v-model="worklistData[8].value"
                                    :placeholder="worklistData[8].default"
                                    :disabled="worklistData[8].select === false" />
                                <input class="input-check-sel p-1" type="checkbox" v-model="worklistData[8].select"
                                    title="Edit Information" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" />
                            </div>
                        </div>

                        <div class="w-100 row" v-else-if="item.name === 'district'">
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{
                item.on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text align-self-center">
                                <input class="input-text-sel" type="text" v-model="item.value"
                                    :placeholder="item.default" :disabled="item.select === false" />
                                <input class="input-check-sel p-1" type="checkbox" v-model="item.select"
                                    title="Edit Information" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" />
                            </div>
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="worklistData[10].tooltip"
                                    data-bs-customClass="custom-tooltip" data-bs-toggle="tooltip"
                                    data-bs-placement="top" data-bs-html="true">{{ worklistData[10].on_display }}</p>
                            </div>
                            <div class="col col-sm-4 card-text align-self-center">
                                <input class="input-text-sel" type="text" v-model="worklistData[10].value"
                                    :placeholder="worklistData[10].default"
                                    :disabled="worklistData[10].select === false" />
                                <input class="input-check-sel p-1" type="checkbox" v-model="worklistData[10].select"
                                    title="Edit Information" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" />
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
                            <div class="col col-sm-10 card-text align-self-center">
                                <textarea class="input-text-sel p-1 mb-0" type="text" v-model="item.value"
                                    :placeholder="item.default" :disabled="item.select === false"></textarea>
                                <input class="input-check-sel p-1" type="checkbox" v-model="item.select"
                                    title="Edit Information" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" />
                            </div> <!--TODO: Check why text area leaving space under-->
                        </div>

                        <div class="w-100 row" v-else>
                            <div class="col col-sm-2 card-text" style="text-align: right">
                                <p class="card-text" :title="item.tooltip" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true">{{
                item.on_display }}</p>
                            </div>
                            <div class="col col-sm-10 card-text align-self-center">
                                <input class="input-text-sel-95 p-1" type="text" v-model="item.value"
                                    :placeholder="item.default" :disabled="item.select === false" />
                                <input class="input-check-sel-5 p-1" type="checkbox" v-model="item.select"
                                    title="Edit Information" data-bs-customClass="custom-tooltip"
                                    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" />
                            </div>
                        </div>
                    </li>
                </div>
            </div>
        </div>
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

export default {
    inject: ['getXpathNode', 'prettifyXml', 'capitalizeFirstLetter', 'createNodesMethods', 'updateNodesMethods'],
    components: {
        Tooltip,
        Modal
    },
    props: ['MEIFiles', 'vT', 'export'],
    emits: ["saveFinished"],
    data() {
        return {
            worklistData: [
                { name: 'author', tag: './/mei:workList//mei:author', value: '', select: false, on_display: 'Author', default: '', tooltip: 'author/informant of song' },
                { name: 'key', tag: './/mei:workList//mei:key', value: '', select: false, on_display: 'Key', default: 'C', tooltip: 'key of song (e.g., C, E Flat)' },
                { name: 'mode', tag: './/mei:workList//mei:key', value: '', select: false, on_display: 'Mode', default: 'Major', tooltip: 'mode of song (e.g., Major, Minor)' },
                { name: 'meter', tag: './/mei:workList//mei:meter', value: '', select: false, on_display: 'Meter', default: 'Binary', tooltip: 'meter of song [enum: Binary, Ternary, Free, Polyrhythmic]' },
                { name: 'tempo', tag: './/mei:workList//mei:tempo', value: '', select: false, on_display: 'Tempo', default: '', tooltip: 'tempo indication of song (e.g., Allegro)' },
                { name: 'language', tag: './/mei:workList//mei:langUsage//mei:language', value: '', select: false, on_display: 'Language', default: 'en', tooltip: 'language of lyrics' },
                { name: 'genre', tag: './/mei:workList//mei:term[@type="genre"]', value: '', select: false, on_display: 'Genre', default: 'Dance', tooltip: 'genre of song (e.g., Children Song, Work Song, Dance, Lullaby)' },
                { name: 'country', tag: './/mei:workList//mei:term[@type="country"]', value: '', select: false, on_display: 'Country', default: 'Ireland', tooltip: 'country from where the song came' },
                { name: 'region', tag: './/mei:workList//mei:term[@type="region"]', value: '', select: false, on_display: 'Region', default: '', tooltip: 'region of the country from where the song came' },
                { name: 'district', tag: './/mei:workList//mei:term[@type="district"]', value: '', select: false, on_display: 'District', default: '', tooltip: 'district of the region from where the song came' },
                { name: 'city', tag: './/mei:workList//mei:term[@type="city"]', value: '', select: false, on_display: 'City', default: '', tooltip: 'city of the district from where the song came' },
            ],
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
        saveToMEI(openModal = true) {

            this.MEIFiles.forEach((file) => {
                if (!this.getXpathNode(file['xmlDoc'], './/mei:work')) {
                    this.createNodesMethods(file['xmlDoc'], 'worklist');
                };
                this.updateNodesMethods(file['xmlDoc'], this.worklistData.filter((item) => item.select === true), 'worklist');
            });

            this.WorklistOntMEI = this.prettifyXml(new XMLSerializer().serializeToString(this.getXpathNode(this.MEIFiles[0]['xmlDoc'], './/mei:work')));

            if (openModal) {
                this.showModal = !this.showModal;
            } else {
                this.$emit("saveFinished", "WorklistForm");
            }
        },
        getInfoFromMEI() {
        }
    }
};
</script>

<style scoped>
#MEI-Modal-Worklist {
    max-height: 80% !important;
}

.input-text-sel {
    width: 90%;
}

.input-check-sel {
    width: 10%;
    height: 1rem;
}

.input-text-sel-95 {
    width: 96.2%;
}

.input-check-sel-5 {
    width: 3.8%;
    height: 1rem;
}
</style>
