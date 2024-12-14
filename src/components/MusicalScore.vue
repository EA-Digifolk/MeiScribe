<template>
    <div class="card-body container score-div-cont">
        <div class="score-page-arrows">
            <button class="" :disabled="pageToRender === 1" @click="prevPage">Previous</button>
            <div class=""> Page <input :disabled="numPages === 1" class="go-page-input" type="number" v-model="this.pageToRender"
                    :placeholder="pageToRender" :min="1" :max="numPages" /> / {{ numPages }}</div>
            <button class="" :disabled="pageToRender === numPages" @click="nextPage">Next</button>
        </div>
        <div class="score-div">
            <img :id="id + '-score-div-img'"/>
        </div>
    </div>
</template>

<script module>
export default {
    props: ['id', 'vT'],
    data() {
        return {
            pageToRender: 1,
            numPages: 1
        }
    },
    mounted() {
        this.getScore();
    },
    watch: {
        pageToRender: async function (newValue, oldValue) {
            if (newValue != oldValue) {
                this.getScore()
            }
        }
    },
    methods: {
        prevPage() {
            if (this.pageToRender > 1) {
                this.pageToRender -= 1;
            }
        },
        nextPage() {
            if (this.pageToRender < this.numPages - 1) {
                this.pageToRender += 1;
            }
        },
        getScore() {
            this.vT.setOptions({
                'adjustPageHeight': true,
                'svgViewBox': true,
                'svgBoundingBoxes': true,
                'breaksNoWidow': true,
                'systemMaxPerPage': 2,
            });
            this.numPages = this.vT.getPageCount();

            let svg = this.vT.renderToSVG(this.pageToRender);
            let blob = new Blob([svg], { type: 'image/svg+xml' });
            let url = URL.createObjectURL(blob);
            let image = document.getElementById(this.id + '-score-div-img');
            image.src = url;
            image.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
            

        }
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