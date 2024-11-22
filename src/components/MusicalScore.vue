<template>
    <div class="card-body container score-div-cont">
        <div class="score-page-arrows">
            <button class="" :disabled="pageToRender === 1" @click="prevPage">Previous</button>
            <div class=""> Page <input :disabled="numPages === 1" class="go-page-input" type="number" v-model="pageToRender.value"
                    :placeholder="pageToRender" :min="1" :max="numPages" /> / {{ numPages }}</div>
            <button class="" :disabled="pageToRender === numPages" @click="nextPage">Next</button>
        </div>
        <div class="score-div">
            <img :id="id + '-score-div-img'"/>
        </div>
    </div>
</template>

<script>
import { onMounted, watch, ref } from 'vue';

export default {
    props: ['id', 'vT'],
    setup(props) {
        const pageToRender = ref(1);
        const numPages = ref(1);

        onMounted(() => { getScore() });
        watch(pageToRender, async (newValue, oldValue) => {
            if (newValue != oldValue) {
                getScore()
            }
        })

        const prevPage = () => {
            if (pageToRender.value > 1) {
                pageToRender.value -= 1;
            }
        }

        const nextPage = () => {
            if (pageToRender.value < numPages - 1) {
                pageToRender.value += 1;
            }
        }

        const getScore = () => {
            props.vT.setOptions({
                //'adjustPageWidth': true,
                'adjustPageHeight': true,
                'svgViewBox': true,
                'svgBoundingBoxes': true,
                //'breaks': 'smart',
                //'breaksSmartSb': .2,
                //'condense': 'encoded',
                'breaksNoWidow': true,
                'systemMaxPerPage': 2,
            });
            numPages.value = props.vT.getPageCount();

            let svg = props.vT.renderToSVG(pageToRender.value);
            let blob = new Blob([svg], { type: 'image/svg+xml' });
            let url = URL.createObjectURL(blob);
            let image = document.getElementById(props.id + '-score-div-img');
            image.src = url;
            image.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
        };

        return {
            numPages,
            pageToRender,
            getScore,
            nextPage,
            prevPage,
        };
    },
}
</script>

<style>
.score-div-cont {
    display: flex !important;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    border: 1px solid black;
    margin-bottom: 1em;
}

.score-page-arrows {
    display: inline-flex;
    justify-content: space-evenly;
    align-items: stretch;
    width: 100%;
    margin-bottom: 1em;
}

.score-div {
    width: 90%;
    height: auto;
    max-height: 15em;
    overflow-y: auto;
}

.go-page-input {
    margin-left: 1em;
}
</style>