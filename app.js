const MAX_TEXT_LENGTH = 500000;
const DEFAULT_LANGUAGE_ID = "english-us";
const LANGUAGE_OPTIONS = [
    { id: "english-uk", label: "English UK", lang: "en", tld: "co.uk", supported: true, note: "Routes English speech through Google United Kingdom for a British accent." },
    { id: "english-us", label: "English US", lang: "en", tld: "com", supported: true, note: "Uses Google's default English voice, which is the closest gTTS match for US English." },
    { id: "english-sa", label: "English SA", lang: "en", tld: "co.za", supported: true, note: "Routes English speech through Google South Africa for a South African accent." },
    { id: "afrikaans", label: "Afrikaans", lang: "af", tld: "com", supported: true, note: "Standard Afrikaans voice from Google Text-to-Speech." },
    { id: "arabic", label: "Arabic", lang: "ar", tld: "com", supported: true, note: "Standard Arabic voice from Google Text-to-Speech." },
    { id: "bengali", label: "Bengali", lang: "bn", tld: "com", supported: true, note: "Standard Bengali voice from Google Text-to-Speech." },
    { id: "chinese-simplified", label: "Chinese (Simplified)", lang: "zh-CN", tld: "com", supported: true, note: "Mandarin speech using the Simplified Chinese voice in gTTS." },
    { id: "chinese-traditional", label: "Chinese (Traditional)", lang: "zh-TW", tld: "com", supported: true, note: "Mandarin speech using the Traditional Chinese voice in gTTS." },
    { id: "dutch", label: "Dutch", lang: "nl", tld: "com", supported: true, note: "Standard Dutch voice from Google Text-to-Speech." },
    { id: "french", label: "French", lang: "fr", tld: "com", supported: true, note: "Standard French voice from Google Text-to-Speech." },
    { id: "german", label: "German", lang: "de", tld: "com", supported: true, note: "Standard German voice from Google Text-to-Speech." },
    { id: "greek", label: "Greek", lang: "el", tld: "com", supported: true, note: "Standard Greek voice from Google Text-to-Speech." },
    { id: "gujarati", label: "Gujarati", lang: "gu", tld: "com", supported: true, note: "Standard Gujarati voice from Google Text-to-Speech." },
    { id: "hausa", label: "Hausa", lang: "ha", tld: "com", supported: true, note: "Standard Hausa voice from Google Text-to-Speech." },
    { id: "hindi", label: "Hindi", lang: "hi", tld: "com", supported: true, note: "Standard Hindi voice from Google Text-to-Speech." },
    { id: "igbo", label: "Igbo", lang: null, tld: null, supported: false, note: "Igbo is not currently available in the installed gTTS language set." },
    { id: "indonesian", label: "Indonesian", lang: "id", tld: "com", supported: true, note: "Standard Indonesian voice from Google Text-to-Speech." },
    { id: "italian", label: "Italian", lang: "it", tld: "com", supported: true, note: "Standard Italian voice from Google Text-to-Speech." },
    { id: "japanese", label: "Japanese", lang: "ja", tld: "com", supported: true, note: "Standard Japanese voice from Google Text-to-Speech." },
    { id: "korean", label: "Korean", lang: "ko", tld: "com", supported: true, note: "Standard Korean voice from Google Text-to-Speech." },
    { id: "portuguese", label: "Portuguese", lang: "pt", tld: "com", supported: true, note: "Uses the Brazilian Portuguese voice exposed by gTTS." },
    { id: "sepedi", label: "Sepedi", lang: null, tld: null, supported: false, note: "Sepedi is not currently available in the installed gTTS language set." },
    { id: "russian", label: "Russian", lang: "ru", tld: "com", supported: true, note: "Standard Russian voice from Google Text-to-Speech." },
    { id: "spanish", label: "Spanish", lang: "es", tld: "com", supported: true, note: "Standard Spanish voice from Google Text-to-Speech." },
    { id: "sotho", label: "Sotho", lang: null, tld: null, supported: false, note: "Sotho is not currently available in the installed gTTS language set." },
    { id: "southern-ndebele", label: "Southern Ndebele", lang: null, tld: null, supported: false, note: "Southern Ndebele is not currently available in the installed gTTS language set." },
    { id: "swahili", label: "Swahili", lang: "sw", tld: "com", supported: true, note: "Standard Swahili voice from Google Text-to-Speech." },
    { id: "swazi", label: "Swazi", lang: null, tld: null, supported: false, note: "Swazi is not currently available in the installed gTTS language set." },
    { id: "turkish", label: "Turkish", lang: "tr", tld: "com", supported: true, note: "Standard Turkish voice from Google Text-to-Speech." },
    { id: "tsonga", label: "Tsonga", lang: null, tld: null, supported: false, note: "Tsonga is not currently available in the installed gTTS language set." },
    { id: "tswana", label: "Tswana", lang: null, tld: null, supported: false, note: "Tswana is not currently available in the installed gTTS language set." },
    { id: "ukrainian", label: "Ukrainian", lang: "uk", tld: "com", supported: true, note: "Standard Ukrainian voice from Google Text-to-Speech." },
    { id: "urdu", label: "Urdu", lang: "ur", tld: "com", supported: true, note: "Standard Urdu voice from Google Text-to-Speech." },
    { id: "venda", label: "Venda", lang: null, tld: null, supported: false, note: "Venda is not currently available in the installed gTTS language set." },
    { id: "vietnamese", label: "Vietnamese", lang: "vi", tld: "com", supported: true, note: "Standard Vietnamese voice from Google Text-to-Speech." },
    { id: "xhosa", label: "Xhosa", lang: null, tld: null, supported: false, note: "Xhosa is not currently available in the installed gTTS language set." },
    { id: "yoruba", label: "Yoruba", lang: null, tld: null, supported: false, note: "Yoruba is not currently available in the installed gTTS language set." },
    { id: "zulu", label: "Zulu", lang: null, tld: null, supported: false, note: "Zulu is not currently available in the installed gTTS language set." },
];

const languageById = Object.fromEntries(LANGUAGE_OPTIONS.map((language) => [language.id, language]));
const supportedLanguages = LANGUAGE_OPTIONS.filter((language) => language.supported);
const unsupportedLanguages = LANGUAGE_OPTIONS.filter((language) => !language.supported);
const highlightColors = ["highlight-1", "highlight-2", "highlight-3", "highlight-4", "highlight-5"];

const textInput = document.getElementById("textInput");
const characterCount = document.getElementById("characterCount");
const clearButton = document.getElementById("clearButton");
const copyButton = document.getElementById("copyButton");
const wordCount = document.getElementById("wordCount");
const charCount = document.getElementById("charCount");
const sentenceCount = document.getElementById("sentenceCount");
const paragraphCount = document.getElementById("paragraphCount");
const avgWords = document.getElementById("avgWords");
const avgChars = document.getElementById("avgChars");
const heroWordCount = document.getElementById("heroWordCount");
const heroCharacterCount = document.getElementById("heroCharacterCount");
const heroSupportedCount = document.getElementById("heroSupportedCount");
const languageSelect = document.getElementById("language");
const selectionNote = document.getElementById("selectionNote");
const ttsSupportedCounts = document.getElementById("ttsSupportedCounts");
const ttsForm = document.getElementById("ttsForm");
const generateButton = document.getElementById("generateButton");
const statusMessage = document.getElementById("statusMessage");
const audioPlayer = document.getElementById("audioPlayer");
const downloadLink = document.getElementById("downloadLink");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const clearHighlightButton = document.getElementById("clearHighlightButton");
const searchInfo = document.getElementById("searchInfo");
const highlightedText = document.getElementById("highlightedText");
const minOccurrences = document.getElementById("minOccurrences");
const densityButton = document.getElementById("densityButton");
const densityResults = document.getElementById("densityResults");
const supportedLanguageChips = document.getElementById("supportedLanguageChips");
const unsupportedLanguageList = document.getElementById("unsupportedLanguageList");

let activeAudioUrl = null;

function setStatus(message, state = "idle") {
    statusMessage.textContent = message;
    statusMessage.dataset.state = state;
}

function cleanupAudioUrl() {
    if (activeAudioUrl) {
        URL.revokeObjectURL(activeAudioUrl);
        activeAudioUrl = null;
    }
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

function countWords(text) {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
}

function countSentences(text) {
    const trimmed = text.trim();
    if (!trimmed) {
        return 0;
    }
    const matches = trimmed.match(/[.!?]+(\s|$)/g);
    return matches ? matches.length : 0;
}

function countParagraphs(text) {
    const trimmed = text.trim();
    if (!trimmed) {
        return 0;
    }
    return trimmed.split(/\n\s*\n+/).filter((paragraph) => paragraph.trim()).length;
}

function isStopWord(word) {
    const stopWords = new Set([
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
        "from", "up", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
        "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "can",
        "this", "that", "these", "those", "i", "you", "he", "she", "it", "we", "they", "my", "your",
        "his", "her", "its", "our", "their", "what", "which", "who", "when", "where", "why", "how",
        "all", "each", "every", "both", "few", "more", "most", "other", "some", "such", "no", "nor",
        "not", "only", "own", "same", "so", "than", "too", "very", "as", "if", "just", "there", "here",
    ]);
    return stopWords.has(word);
}

function renderLanguageOptions() {
    const supportedGroup = document.createElement("optgroup");
    supportedGroup.label = "Available in gTTS";

    supportedLanguages.forEach((language) => {
        const option = document.createElement("option");
        option.value = language.id;
        option.textContent = language.label;
        if (language.id === DEFAULT_LANGUAGE_ID) {
            option.selected = true;
        }
        supportedGroup.appendChild(option);
    });

    const unsupportedGroup = document.createElement("optgroup");
    unsupportedGroup.label = "Requested but unavailable";

    unsupportedLanguages.forEach((language) => {
        const option = document.createElement("option");
        option.value = language.id;
        option.textContent = `${language.label} - unavailable`;
        option.disabled = true;
        unsupportedGroup.appendChild(option);
    });

    languageSelect.append(supportedGroup, unsupportedGroup);
}

function renderCoverage() {
    heroSupportedCount.textContent = String(supportedLanguages.length);
    ttsSupportedCounts.textContent = `${supportedLanguages.length} supported | ${unsupportedLanguages.length} unavailable`;

    supportedLanguages.forEach((language) => {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = language.label;
        supportedLanguageChips.appendChild(chip);
    });

    unsupportedLanguages.forEach((language) => {
        const item = document.createElement("li");
        item.textContent = language.label;
        unsupportedLanguageList.appendChild(item);
    });
}

function updateLanguageNote() {
    const selectedLanguage = languageById[languageSelect.value];
    selectionNote.textContent = selectedLanguage?.note || "";
}

function updateStatistics() {
    const text = textInput.value;
    const words = countWords(text);
    const chars = text.length;
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);

    wordCount.textContent = String(words);
    charCount.textContent = String(chars);
    sentenceCount.textContent = String(sentences);
    paragraphCount.textContent = String(paragraphs);
    avgWords.textContent = sentences > 0 ? (words / sentences).toFixed(2) : "0";
    avgChars.textContent = words > 0 ? (chars / words).toFixed(2) : "0";

    heroWordCount.textContent = String(words);
    heroCharacterCount.textContent = String(chars);
    characterCount.textContent = `${chars} / ${MAX_TEXT_LENGTH}`;

    if (!searchInput.value.trim()) {
        highlightedText.textContent = text || "Your text will appear here with highlighted keywords.";
    }
}

function clearHighlight() {
    searchInput.value = "";
    searchInfo.textContent = "";
    highlightedText.textContent = textInput.value || "Your text will appear here with highlighted keywords.";
}

function searchKeywords() {
    const searchTerm = searchInput.value.trim();
    const text = textInput.value;

    if (!searchTerm) {
        searchInfo.textContent = "Please enter keywords to search.";
        highlightedText.textContent = text || "Your text will appear here with highlighted keywords.";
        return;
    }

    if (!text.trim()) {
        searchInfo.textContent = "Please paste text first.";
        highlightedText.textContent = "Please paste text first.";
        return;
    }

    const keywords = searchTerm
        .split(",")
        .map((keyword) => keyword.trim().toLowerCase())
        .filter(Boolean);

    if (!keywords.length) {
        searchInfo.textContent = "Please enter valid keywords.";
        return;
    }

    const keywordCounts = {};
    let totalMatches = 0;

    keywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "gi");
        const matches = text.match(regex) || [];
        keywordCounts[keyword] = matches.length;
        totalMatches += matches.length;
    });

    let highlightedContent = escapeHtml(text);
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);

    sortedKeywords.forEach((keyword, index) => {
        const colorClass = highlightColors[index % highlightColors.length];
        const regex = new RegExp(`\\b(${escapeRegExp(keyword)})\\b`, "gi");
        highlightedContent = highlightedContent.replace(regex, `<span class="${colorClass}">$1</span>`);
    });

    highlightedText.innerHTML = highlightedContent;
    searchInfo.innerHTML = `Found ${totalMatches} match${totalMatches !== 1 ? "es" : ""} for ${keywords.length} keyword${keywords.length !== 1 ? "s" : ""}: ${keywords.map((keyword, index) => `<strong class="${highlightColors[index % highlightColors.length]}">${escapeHtml(keyword)}</strong> (${keywordCounts[keyword]})`).join(", ")}`;
}

function calculateDensity() {
    const text = textInput.value;
    if (!text.trim()) {
        densityResults.innerHTML = '<p class="placeholder-text">Please paste text first.</p>';
        return;
    }

    const minimum = Number.parseInt(minOccurrences.value, 10) || 2;
    const words = text.toLowerCase().match(/\b[a-z0-9]+(?:'[a-z]+)?\b/g) || [];

    if (!words.length) {
        densityResults.innerHTML = '<p class="placeholder-text">No words found in text.</p>';
        return;
    }

    const wordFrequency = {};
    words.forEach((word) => {
        if (!isStopWord(word)) {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        }
    });

    const filteredWords = Object.entries(wordFrequency)
        .filter(([, count]) => count >= minimum)
        .sort((left, right) => right[1] - left[1]);

    if (!filteredWords.length) {
        densityResults.innerHTML = `<p class="placeholder-text">No keywords found with at least ${minimum} occurrences. Try lowering the minimum.</p>`;
        return;
    }

    const totalWords = Object.values(wordFrequency).reduce((sum, count) => sum + count, 0);
    const maxCount = Math.max(...filteredWords.map(([, count]) => count));

    densityResults.innerHTML = filteredWords.slice(0, 25).map(([word, count]) => {
        const density = ((count / totalWords) * 100).toFixed(2);
        const barWidth = (count / maxCount) * 100;
        return `
            <div class="density-item">
                <div class="density-word">${escapeHtml(word)}</div>
                <div class="density-stats">
                    <div class="density-bar">
                        <div class="density-bar-fill" style="width: ${barWidth}%"></div>
                    </div>
                    <div class="density-count">${count}</div>
                    <div class="density-percent">${density}%</div>
                </div>
            </div>
        `;
    }).join("");
}

async function copyText() {
    const text = textInput.value;
    if (!text) {
        window.alert("No text to copy.");
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        const originalLabel = copyButton.textContent;
        copyButton.textContent = "Copied!";
        window.setTimeout(() => {
            copyButton.textContent = originalLabel;
        }, 2000);
    } catch {
        window.alert("Failed to copy text.");
    }
}

function clearText() {
    textInput.value = "";
    updateStatistics();
    clearHighlight();
    densityResults.innerHTML = '<p class="placeholder-text">Keyword density will appear here.</p>';
}

async function handleSubmit(event) {
    event.preventDefault();

    const text = textInput.value.trim();
    const selectedLanguage = languageById[languageSelect.value];
    const slow = ttsForm.elements.tempo.value === "slow";

    if (!text) {
        setStatus("Paste some text before trying to generate audio.", "error");
        return;
    }

    if (!selectedLanguage?.supported) {
        setStatus("Choose one of the currently available language options.", "error");
        return;
    }

    generateButton.disabled = true;
    generateButton.textContent = "Generating...";
    setStatus(`Generating speech for ${selectedLanguage.label}.`);

    try {
        const response = await fetch("/api/speak", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                language: selectedLanguage.id,
                text,
                slow,
            }),
        });

        if (!response.ok) {
            const errorPayload = await response.json().catch(() => ({}));
            throw new Error(errorPayload.error || "Unable to generate speech right now.");
        }

        const audioBlob = await response.blob();
        const fileName = response.headers.get("X-Audio-Filename") || "uthetha-speech.mp3";

        cleanupAudioUrl();
        activeAudioUrl = URL.createObjectURL(audioBlob);

        audioPlayer.src = activeAudioUrl;
        audioPlayer.hidden = false;
        audioPlayer.load();

        downloadLink.href = activeAudioUrl;
        downloadLink.download = fileName;
        downloadLink.hidden = false;

        setStatus(`MP3 ready for ${selectedLanguage.label}${slow ? " in slow mode" : ""}.`, "success");
    } catch (error) {
        setStatus(error.message || "Unable to generate speech right now.", "error");
    } finally {
        generateButton.disabled = false;
        generateButton.textContent = "Generate MP3 speech";
    }
}

function bindEvents() {
    textInput.addEventListener("input", updateStatistics);
    clearButton.addEventListener("click", clearText);
    copyButton.addEventListener("click", copyText);
    languageSelect.addEventListener("change", updateLanguageNote);
    searchButton.addEventListener("click", searchKeywords);
    clearHighlightButton.addEventListener("click", clearHighlight);
    densityButton.addEventListener("click", calculateDensity);
    ttsForm.addEventListener("submit", handleSubmit);
    window.addEventListener("beforeunload", cleanupAudioUrl);

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            event.preventDefault();
            const href = anchor.getAttribute("href");
            const target = href ? document.querySelector(href) : null;
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
}

function initialize() {
    renderLanguageOptions();
    renderCoverage();
    bindEvents();
    updateLanguageNote();
    updateStatistics();
    clearHighlight();
}

document.addEventListener("DOMContentLoaded", initialize);
