
import * as NLPUtils from 'wink-nlp-utils';

let customStopWords = {
    'ES': [
        'lalala', 'nanana', 'tin', 'tan', 'ton', 'tar', 'chin', 'rile', 'run', 'tri', 'ten', 'quo',
        'nas', 'bre', 'tir', 'rre', 'lla', 'din', 'bon', 'pur', 'yeah', 'oh', 'o', 'pum', 'diu',
        'non', 'per', 'tra', 'ay', 'ea', 'murru', 'trebolé', 'patiné', 'ro', 'do', 'álimon', 'ra',
        'pin', 'nea', 'plun', 'ova', 'güi', 'miau', 'dimir', 'quiri', 'cubilitero', 'quére', 'carabí',
        'barrabín', 'ruflí', 'pachín', 'campán', 'míquiri', 'trálaro', 'salvir', 'vién', 'carminuca',
        'isabelitar', 'virulí', 'bordín', 'giraldar', 'mió', 'verdád', 'rir', 'volviar', 'andir',
        'entrastar', 'renguir', 'rorar', 'tuertar', 'duermar', 'tralar', 'guri', 'banrandilla', 'aaar',
        'cer', 'resaladitar', 'cochereré', 'chunda', 'nir', 'rumrum', 'tarara', 'chalinerir', 'hachei',
        'trichú', 'llueir', 'tcha', 'chumba', 'tuli', 'rumbé', 'chíguiri', 'pimpinuco', 'tín',
        'coroclocar', 'chivirivirí', 'yagáchate', 'quiquili', 'labirum', 'nán', 'dongolondera',
        'menudín', 'arrorro', 'silbantón', 'retán', 'ringue', 'trebole', 'tiego', 'clorocloclar',
        'capricornia', 'resalado', 'lindrón', 'mañaname', 'caballé', 'tonado', 'matarile', 'dindón',
        'nenir', 'retoto', 'reló', 'guar', 'mare', 'hache', 'chau', 'logi', 'ambo', 'arre', 'roro',
        'gori', 'toto', 'dad', 'fet', 'boy', 'bas', 'rar', 'rin', 'des', 'nel', 'hom', 'yer', 'sion',
        'tum', 'aur', 'nani', 'liz', 'bia', 'tet', 'com', 'sito', 'char', 'así', 'assim', 'nan', 'pra',
        'tim', 'mas', 'más', 'ole', 'olé', '-', 'ojo', 'eje', 'ijo'
    ],
    'PT': [
        'lalala', 'nanana', 'tin', 'tan', 'ton', 'tar', 'chin', 'rile', 'run', 'tri', 'ten', 'quo',
        'nas', 'bre', 'tir', 'rre', 'lla', 'din', 'bon', 'pur', 'yeah', 'oh', 'o', 'pum', 'diu',
        'non', 'per', 'tra', 'ay', 'ea', 'murru', 'trebolé', 'patiné', 'ro', 'do', 'álimon', 'ra',
        'pin', 'nea', 'plun', 'ova', 'güi', 'miau', 'dimir', 'quiri', 'cubilitero', 'quére', 'carabí',
        'barrabín', 'ruflí', 'pachín', 'campán', 'míquiri', 'trálaro', 'salvir', 'vién', 'carminuca',
        'isabelitar', 'virulí', 'bordín', 'giraldar', 'mió', 'verdád', 'rir', 'volviar', 'andir',
        'entrastar', 'renguir', 'rorar', 'tuertar', 'duermar', 'tralar', 'guri', 'banrandilla', 'aaar',
        'cer', 'resaladitar', 'cochereré', 'chunda', 'nir', 'rumrum', 'tarara', 'chalinerir', 'hachei',
        'trichú', 'llueir', 'tcha', 'chumba', 'tuli', 'rumbé', 'chíguiri', 'pimpinuco', 'tín',
        'coroclocar', 'chivirivirí', 'yagáchate', 'quiquili', 'labirum', 'nán', 'dongolondera',
        'menudín', 'arrorro', 'silbantón', 'retán', 'ringue', 'trebole', 'tiego', 'clorocloclar',
        'capricornia', 'resalado', 'lindrón', 'mañaname', 'caballé', 'tonado', 'matarile', 'dindón',
        'nenir', 'retoto', 'reló', 'guar', 'mare', 'hache', 'chau', 'logi', 'ambo', 'arre', 'roro',
        'gori', 'toto', 'dad', 'fet', 'boy', 'bas', 'rar', 'rin', 'des', 'nel', 'hom', 'yer', 'sion',
        'tum', 'aur', 'nani', 'liz', 'bia', 'tet', 'com', 'sito', 'char', 'así', 'assim', 'nan', 'pra', 
        'tim', 'mas', 'más', 'ole', 'olé'
    ],
    'EN': []
};

export const topicDict = {
    PT: {
        "Performative & Descriptive": ["pantaleão", "vaitar"],
        "Narrative Symbolisms": ["narrative"], // placeholder if you want to match general narrative terms
        "Spatial & Maritime": ["barca", "serra"],
        "Folklore & Locality": ["folklore"], // optional
        "Places & Cultural Items": ["loulé", "terrêu"],
        "Named Characters": ["malhão", "anica"],
        "Play & Rhythm": ["play", "rhythm"], // optional
        "Games & Iteration": ["bater", "ora", "passar"]
    },
    ES: {
        "Nature & Symbolism": ["nature", "symbolism"], // optional general terms
        "Symbolic & Traditional": ["oro", "flor"],
        "Natural Imagery": ["sol", "yerba", "lloviendo"],
        "Ritual & Morality": ["ritual", "morality"], // optional
        "Honorific": ["don", "señor"],
        "Religious": ["alma", "virgen", "jesús", "jesú"],
        "Care & Emotion": ["care", "emotion"], // optional
        "Affect & Desire": ["querer", "niñito"],
        "Family": ["madre", "niño"],
        "Lullaby": ["duermet", "niño", "ya", "acostar"],
        "Fantasy": ["coco", "monstruo", "fantasma"],
        "Nature": ["sol", "luna", "estrella"],
        "Animals": ["gato", "gata", "cabra", "caballo", "puça", "poi"]
    },
    EN: {

    }
};


/**
 * Extract and compile lyrics from MEI XML with proper segmentation.
 * - Prefers <workList>/<incip type="lyrics">/<incipText>
 * - Falls back to <note>/<verse>/<syl> with correct syllabic joining
 * @param {string} MEIData - The MEI XML content 
 * @returns {string} - The compiled lyrics text
 */
export const extractSegmentedLyricsFromMEI = (MEIData) => {

    // 1️⃣ Try to get lyrics from <workList> → <incip type="lyrics"> → <incipText>
    const incipText = MEIData.querySelector('workList work incip[type="lyrics"] incipText');
    if (incipText && incipText.textContent.trim()) {
        return incipText.textContent
            .replace(/\s+/g, " ")
            .trim();
    }

    // 2️⃣ Fallback: compile lyrics from notes
    const versesByNumber = {};

    MEIData.querySelectorAll("note verse").forEach(verse => {
        const verseNum = verse.getAttribute("n") || "1";
        if (!versesByNumber[verseNum]) versesByNumber[verseNum] = [];

        const syl = verse.querySelector("syl");
        if (syl && syl.textContent.trim()) {
            const wordpos = syl.getAttribute("wordpos") || "s";
            const text = syl.textContent.trim();

            // Add syllable with correct spacing logic
            const currentLine = versesByNumber[verseNum];
            if (wordpos === "i") {
                // start of a new word
                currentLine.push(text);
            } else if (wordpos === "m") {
                // middle of word, append without space
                currentLine[currentLine.length - 1] += text;
            } else if (wordpos === "t") {
                // terminal, append without space, add a space after
                currentLine[currentLine.length - 1] += text;
            } else {
                // single-syllable word
                currentLine.push(text);
            }
        }
    });

    // 3️⃣ Join each verse line
    const compiled = Object.entries(versesByNumber)
        .map(([num, words]) => words.join(" "))
        .join("\n");

    return compiled.trim();
};

function buildFreqMap(ngrams) {
    const freqMap = {};
    for (const phrase of ngrams) {
        if (freqMap[phrase]) {
            freqMap[phrase] += 1;
        } else {
            freqMap[phrase] = 1;
        }
    }
    return freqMap;
};

/**
 * Extract top keyphrases from text (TextRank-style)
 */
function extractTopKeyphrases(text, phraseLen = 2, ngramSize = 2) {
    if (!text || typeof text !== 'string') return '';

    // Tokenize + lowercase
    let tokens = NLPUtils.string.tokenize(text, true)
        .filter((t) => t.tag === 'word')
        .map((t) => NLPUtils.string.lowerCase(t.value));

    // Remove stopwords
    const stopwords = NLPUtils.helper.returnWordsFilter(customStopWords['ES'], [NLPUtils.string.lowerCase]);
    tokens = NLPUtils.tokens.removeWords(tokens, stopwords);

    // Filter short/invalid tokens
    tokens = tokens.filter((w) => w.length >= 3 && /^[a-záéíóúüñ]+$/.test(w));

    // Build n-grams
    let ngrams = [];
    for (let n = 1; n <= ngramSize; n++) {
        ngrams = ngrams.concat(NLPUtils.string.ngram(tokens, n).map((g) => g.join(' ')));
    }

    // Frequency scoring (simple TextRank proxy)
    const freqMap = buildFreqMap(ngrams);

    // Sort and pick top phrases
    return Object.entries(freqMap)
        .sort((a, b) => b[1] - a[1])
        .map(([phrase]) => phrase)
        .slice(0, phraseLen)
        .join(' ');
};

function inferTopicsWeighted(unigrams, bigrams, keyphrases, topicDict) {
    const tokens = new Set([...unigrams, ...bigrams, ...keyphrases.split(' ')]);
    const weights = { unigram: 1, bigram: 1.5, keyphrase: 2 };
    const topicScores = {};

    for (const [topic, keywords] of Object.entries(topicDict)) {
        let score = 0;
        for (const kw of keywords) {
            if (tokens.has(kw)) score += 1; // you could apply weights here
        }
        topicScores[topic] = score;
    }

    return Object.entries(topicScores)
        .filter(([, score]) => score > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([topic]) => topic);
};

export const getAutomaticVocalTopics = (MEIData, Country='ES') => {
    // 1️⃣ Extract lyrics text
    let lyrics = extractSegmentedLyricsFromMEI(MEIData);
    if (!lyrics || typeof lyrics !== 'string' || lyrics.trim() === '') return '';

    // 2️⃣ Clean text
    let cleanLyrics = NLPUtils.string.amplifyNotElision(lyrics);
    cleanLyrics = NLPUtils.string.removeExtraSpaces(cleanLyrics);
    cleanLyrics = NLPUtils.string.removePunctuations(cleanLyrics);
    cleanLyrics = NLPUtils.string.removeSplChars(cleanLyrics);

    // 3️⃣ Tokenize
    const tokens = NLPUtils.string.tokenize(cleanLyrics, true);

    // 4️⃣ Build stopword filter for Spanish
    const myCustomStopWords = NLPUtils.helper.returnWordsFilter(
        customStopWords[Country], // e.g. ["el", "la", "de", "que", ...]
        [NLPUtils.string.lowerCase]
    );

    // 5️⃣ Remove stopwords and non-word tokens
    const tokensNoStop = NLPUtils.tokens.removeWords(
        tokens
            .filter((t) => t.tag === 'word') // keep only real words
            .map((t) => t.value),
        myCustomStopWords
    );

    // 6️⃣ Lemmatize (wink-nlp-utils doesn’t have true lemmatization, so stem instead)
    const lemmatizedTokens = tokensNoStop.map((w) =>
        NLPUtils.string.stem(w.toLowerCase())
    );

    // 7️⃣ Filter out short tokens (optional)
    const minWordLength = 3;
    const filteredTokens = lemmatizedTokens.filter(
        (w) => w.length >= minWordLength && /^[a-záéíóúüñ]+$/.test(w)
    );

    // 8️⃣ Return clean string or array, depending on downstream use
    const lyricsCleaned = filteredTokens.join(' ');

    // 8️⃣ Generate n-grams
    const unigrams = filteredTokens;
    const bigrams = NLPUtils.string.ngram(filteredTokens, 2).map((n) => n.join(' '));

    // 9️⃣ Frequency maps
    const unigramFreq = NLPUtils.tokens.bagOfWords(unigrams);
    const bigramFreq = buildFreqMap(bigrams);

    // 1️⃣0️⃣ Sort to get top ones
    const mostRepeatedUnigram = Object.entries(unigramFreq)
        .sort((a, b) => b[1] - a[1])[0] || [null, 0];

    const mostRepeatedBigram = Object.entries(bigramFreq)
        .sort((a, b) => b[1] - a[1])[0] || [null, 0];


    // 1️⃣1️⃣ Keywords (top 20 unigrams)
    const keywords = Object.keys(unigramFreq)
        .sort((a, b) => unigramFreq[b] - unigramFreq[a])
        .slice(0, 20);

    // 1️⃣2️⃣ Extract top keyphrases (TextRank-style)
    const keyphrases = extractTopKeyphrases(lyricsCleaned, 2, 2); // phraseLen=2, ngramSize=2

    // 1️⃣3️⃣ Topic Inference
    const topics = inferTopicsWeighted(unigrams, bigrams, keyphrases, topicDict[Country]);

    // 1️⃣4️⃣ Return all results
    const result = {
        original: lyrics,
        clean: lyricsCleaned,
        unigrams,
        weighted_unigrams: unigramFreq,
        bigrams,
        weighted_bigrams: bigramFreq,
        keywords,
        mostRepeated: {
            unigram: { word: mostRepeatedUnigram[0], count: mostRepeatedUnigram[1] },
            bigram: { phrase: mostRepeatedBigram[0], count: mostRepeatedBigram[1] }
        },
        keyphrases,
        topics
    };

    return result;
};