
const getLyricsFromMEI = (MEIData) => {
    // 1️⃣ Try to get lyrics from <workList> → <incip type="lyrics"> → <incipText>
    const incipText = MEIData.querySelector('workList work incip[type="lyrics"] incipText');
    if (incipText && incipText.textContent.trim()) {
        return incipText.textContent
            .replace(/\s+/g, " ") // normalize spaces/newlines
            .trim();
    }

    // 2️⃣ If not found, collect lyrics from notes
    const syllables = [...MEIData.querySelectorAll("note verse syl")]
        .map(syl => syl.textContent.trim())
        .filter(Boolean);

    if (syllables.length > 0) {
        return syllables.join(" ").replace(/\s+/g, " ").trim();
    }

    // 3️⃣ No lyrics found
    return "";
};

export const getAutomaticVocalTopics = (MEIData) => {

    getLyricsFromMEI(MEIData);

};