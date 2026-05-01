const textAreas = Array.from(document.querySelectorAll('.similarity-text'));
const uploadInputs = Array.from(document.querySelectorAll('.text-upload'));
const analyzeButton = document.getElementById('analyzeSimilarity');
const clearButton = document.getElementById('clearSimilarity');
const statusMessage = document.getElementById('similarityStatus');
const resultsSection = document.getElementById('similarityResults');
const similarityTable = document.getElementById('similarityTable');

function tokenize(text) {
    return new Set(
        text
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu, ' ')
            .split(/\s+/)
            .filter(Boolean)
    );
}

function jaccardSimilarity(firstText, secondText) {
    const firstTokens = tokenize(firstText);
    const secondTokens = tokenize(secondText);

    if (firstTokens.size === 0 && secondTokens.size === 0) {
        return 100;
    }

    const intersectionSize = [...firstTokens].filter((token) => secondTokens.has(token)).length;
    const unionSize = new Set([...firstTokens, ...secondTokens]).size;

    return unionSize === 0 ? 0 : (intersectionSize / unionSize) * 100;
}

function setStatus(message, state = 'idle') {
    statusMessage.textContent = message;
    statusMessage.dataset.state = state;
}

function buildTable(entries) {
    const labels = entries.map(({ label }) => label);
    let tableMarkup = '<thead><tr><th>Text</th>';
    labels.forEach((label) => {
        tableMarkup += `<th>${label}</th>`;
    });
    tableMarkup += '</tr></thead><tbody>';

    entries.forEach((rowEntry, rowIndex) => {
        tableMarkup += `<tr><th>${rowEntry.label}</th>`;
        entries.forEach((columnEntry, columnIndex) => {
            if (rowIndex === columnIndex) {
                tableMarkup += '<td>100.00%</td>';
            } else {
                const score = jaccardSimilarity(rowEntry.text, columnEntry.text);
                tableMarkup += `<td>${score.toFixed(2)}%</td>`;
            }
        });
        tableMarkup += '</tr>';
    });

    tableMarkup += '</tbody>';
    similarityTable.innerHTML = tableMarkup;
}

function analyzeSimilarity() {
    const populatedEntries = textAreas
        .map((area, index) => ({ text: area.value.trim(), label: `Text ${index + 1}` }))
        .filter(({ text }) => text.length > 0);

    if (populatedEntries.length < 2) {
        resultsSection.hidden = true;
        setStatus('Please add content in at least two text boxes before analyzing.', 'error');
        return;
    }

    buildTable(populatedEntries);
    resultsSection.hidden = false;
    setStatus(`Analysis complete for ${populatedEntries.length} text(s).`, 'success');
}

function clearAll() {
    textAreas.forEach((area) => {
        area.value = '';
    });
    uploadInputs.forEach((input) => {
        input.value = '';
    });
    similarityTable.innerHTML = '';
    resultsSection.hidden = true;
    setStatus('All text inputs cleared.', 'idle');
}

uploadInputs.forEach((input) => {
    input.addEventListener('change', async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        try {
            const fileText = await file.text();
            const target = textAreas[Number(input.dataset.index)];
            if (target) {
                target.value = fileText;
                setStatus(`${file.name} loaded into Text ${Number(input.dataset.index) + 1}.`, 'success');
            }
        } catch (error) {
            setStatus(`Could not read ${file.name}. Please try a plain-text file.`, 'error');
        }
    });
});

analyzeButton.addEventListener('click', analyzeSimilarity);
clearButton.addEventListener('click', clearAll);
