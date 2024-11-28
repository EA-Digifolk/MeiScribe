<template>
    <div class="card-body container score-div-cont">
        <div class="score-page-arrows">
            <div id="ScoreSelectedID"></div>
            <button class="" :disabled="pageToRender === 1" @click="prevPage">Previous</button>
            <div class=""> Page <input :disabled="numPages === 1" class="go-page-input" type="number"
                    v-model="pageToRender.value" :placeholder="pageToRender" :min="1" :max="numPages" /> / {{ numPages
                }}</div>
            <button class="" :disabled="pageToRender === numPages" @click="nextPage">Next</button>
        </div>
        <div :id="id + '-score-div-img'" class="score-div">
        </div>
    </div>
</template>

<script>
import { onMounted, watch, ref } from 'vue';

export default {
    props: ['id', 'vT', 'selectNote'],
    setup(props) {
        const pageToRender = ref(1);
        const numPages = ref(1);

        onMounted(() => { getScore() });
        watch(pageToRender, async (newValue, oldValue) => {
            if (newValue != oldValue) {
                getScore()
            }
        });

        const prevPage = () => {
            if (pageToRender.value > 1) {
                pageToRender.value -= 1;
            }
        };

        const nextPage = () => {
            if (pageToRender.value < numPages - 1) {
                pageToRender.value += 1;
            }
        }

        const getScore = () => {
            props.vT.setOptions({
                'adjustPageHeight': true,
                'svgViewBox': true,
                'svgBoundingBoxes': true,
                'breaksNoWidow': true,
                'systemMaxPerPage': 2,
                'svgAdditionalAttribute': 'note@id'
            });
            numPages.value = props.vT.getPageCount();

            let svg = props.vT.renderToSVG(pageToRender.value);
            let image = document.getElementById(props.id + '-score-div-img');
            image.innerHTML = svg.trim();

            let notesOnSVG = document.getElementsByClassName('note');
            Array.from(notesOnSVG).forEach((e, _) => {
                if (!e.classList.contains('bounding-box')) {
                    let sc = document.getElementById('ScoreSelectedID');
                    e.addEventListener('mouseenter', () => {
                        sc.innerHTML = 'ID: ' + e.id;
                        sc.style.padding = '.4em';
                    });
                    e.addEventListener('mouseleave', () => {
                        sc.innerHTML = '';
                        sc.style.padding = '0em';
                    });
                }
            });
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

g.note.select-start {
    color: red !important;
    fill: red !important;
}

g.note.select-end {
    color: green !important;
    fill: green !important;
}

:hover.note {
    fill: dodgerblue;
    stroke: white;
    stroke-width: 2px;
    filter: url(#dropshadow);
}

#ScoreSelectedID {
    position: absolute;
    top: auto;
    left: 7%;
    background-color:dodgerblue;
    color:aliceblue;
}
</style>