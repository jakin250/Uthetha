const config = window.uthethaConfig || {};
const languages = Array.isArray(config.languages) ? config.languages : [];
const languageById = Object.fromEntries(languages.map((language) => [language.id, language]));

const form = document.getElementById("ttsForm");
const languageSelect = document.getElementById("language");
const textArea = document.getElementById("speechText");
const statusMessage = document.getElementById("statusMessage");
const selectionNote = document.getElementById("selectionNote");
const characterCount = document.getElementById("characterCount");
const generateButton = document.getElementById("generateButton");
const audioPlayer = document.getElementById("audioPlayer");
const downloadLink = document.getElementById("downloadLink");

let activeAudioUrl = null;

function setStatus(message, state = "idle") {
    statusMessage.textContent = message;
    statusMessage.dataset.state = state;
}

function updateLanguageNote() {
    const selectedLanguage = languageById[languageSelect.value];
    selectionNote.textContent = selectedLanguage?.note || "";
}

function updateCharacterCount() {
    const currentLength = textArea.value.length;
    characterCount.textContent = `${currentLength} / ${config.maxTextLength || 50000}`;
}

function cleanupAudioUrl() {
    if (activeAudioUrl) {
        URL.revokeObjectURL(activeAudioUrl);
        activeAudioUrl = null;
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    const text = textArea.value.trim();
    const selectedLanguage = languageById[languageSelect.value];
    const slow = form.elements.tempo.value === "slow";

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
    setStatus(`Generating speech for ${selectedLanguage.label}.`, "idle");

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

        setStatus(
            `MP3 ready for ${selectedLanguage.label}${slow ? " in slow mode" : ""}.`,
            "success",
        );
    } catch (error) {
        setStatus(error.message || "Unable to generate speech right now.", "error");
    } finally {
        generateButton.disabled = false;
        generateButton.textContent = "Generate MP3 speech";
    }
}

languageSelect.addEventListener("change", updateLanguageNote);
textArea.addEventListener("input", updateCharacterCount);
form.addEventListener("submit", handleSubmit);
window.addEventListener("beforeunload", cleanupAudioUrl);

if (config.defaultLanguageId && languageById[config.defaultLanguageId]) {
    languageSelect.value = config.defaultLanguageId;
}

updateLanguageNote();
updateCharacterCount();
