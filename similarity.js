const textAreas = Array.from(document.querySelectorAll('.similarity-text'));
const uploadInputs = Array.from(document.querySelectorAll('.text-upload'));
const previews = Array.from(document.querySelectorAll('.text-preview'));
const analyzeButton = document.getElementById('analyzeSimilarity');
const clearButton = document.getElementById('clearSimilarity');
const statusMessage = document.getElementById('similarityStatus');
const overallScore = document.getElementById('overallScore');
const resultsSection = document.getElementById('similarityResults');
const similarityTable = document.getElementById('similarityTable');
const grammarResults = document.getElementById('grammarResults');
const grammarOutput = document.getElementById('grammarOutput');
const grammarSummary = document.getElementById('grammarSummary');
const matchResults = document.getElementById('matchResults');
const matchLegend = document.getElementById('matchLegend');
const matchList = document.getElementById('matchList');
const similarityPanel = document.querySelector('.similarity-panel');
const HIGHLIGHT_CLASSES = ['highlight-1', 'highlight-2', 'highlight-3', 'highlight-4', 'highlight-5'];

const escapeHtml = (value) => value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

function normalizeWhitespace(text) { return text.replace(/\s+/g, ' ').trim(); }
function tokenize(text) { return new Set(text.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, ' ').split(/\s+/).filter(Boolean)); }
function tokenList(text) { return text.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, ' ').split(/\s+/).filter(Boolean); }
function splitSentences(text) { return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean); }

function jaccardSimilarity(a, b) {
    const x = tokenize(a); const y = tokenize(b);
    if (!x.size && !y.size) return 100;
    const i = [...x].filter((t) => y.has(t)).length;
    const u = new Set([...x, ...y]).size;
    return u ? (i / u) * 100 : 0;
}

function ngramSet(tokens, n = 3) {
    const set = new Set();
    for (let i = 0; i <= tokens.length - n; i += 1) set.add(tokens.slice(i, i + n).join(' '));
    return set;
}

function cosineSimilarity(a, b) {
    const freq = (tokens) => tokens.reduce((m, t) => (m.set(t, (m.get(t) || 0) + 1), m), new Map());
    const aFreq = freq(tokenList(a)); const bFreq = freq(tokenList(b));
    const terms = new Set([...aFreq.keys(), ...bFreq.keys()]);
    let dot = 0; let aNorm = 0; let bNorm = 0;
    terms.forEach((term) => {
        const av = aFreq.get(term) || 0; const bv = bFreq.get(term) || 0;
        dot += av * bv; aNorm += av * av; bNorm += bv * bv;
    });
    if (!aNorm || !bNorm) return 0;
    return (dot / (Math.sqrt(aNorm) * Math.sqrt(bNorm))) * 100;
}

function fingerprintSimilarity(a, b) {
    const aTri = ngramSet(tokenList(a), 3); const bTri = ngramSet(tokenList(b), 3);
    if (!aTri.size && !bTri.size) return 100;
    const overlap = [...aTri].filter((g) => bTri.has(g)).length;
    const union = new Set([...aTri, ...bTri]).size;
    return union ? (overlap / union) * 100 : 0;
}

function levenshteinSimilarity(a, b) {
    const s = normalizeWhitespace(a.toLowerCase()); const t = normalizeWhitespace(b.toLowerCase());
    if (!s.length && !t.length) return 100;
    const rows = s.length + 1; const cols = t.length + 1;
    const dp = Array.from({ length: rows }, (_, i) => [i]);
    for (let j = 1; j < cols; j += 1) dp[0][j] = j;
    for (let i = 1; i < rows; i += 1) {
        for (let j = 1; j < cols; j += 1) {
            const cost = s[i - 1] === t[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
        }
    }
    const dist = dp[rows - 1][cols - 1];
    return Math.max(0, (1 - (dist / Math.max(s.length, t.length))) * 100);
}

function compositeSimilarity(a, b) {
    const jaccard = jaccardSimilarity(a, b);
    const cosine = cosineSimilarity(a, b);
    const fingerprint = fingerprintSimilarity(a, b);
    const edit = levenshteinSimilarity(a, b);
    return (jaccard * 0.25) + (cosine * 0.35) + (fingerprint * 0.25) + (edit * 0.15);
}

function setStatus(message, state = 'idle') { statusMessage.textContent = message; statusMessage.dataset.state = state; }

function buildTable(entries) {
    const labels = entries.map(({ label }) => label);
    let html = '<thead><tr><th>Text</th>' + labels.map((l) => `<th>${l}</th>`).join('') + '</tr></thead><tbody>';
    let total = 0; let count = 0;
    entries.forEach((r, ri) => {
        html += `<tr><th>${r.label}</th>`;
        entries.forEach((c, ci) => {
            if (ri === ci) { html += '<td>100.00%</td>'; return; }
            const score = compositeSimilarity(r.text, c.text);
            if (ci > ri) { total += score; count += 1; }
            html += `<td>${score.toFixed(2)}%</td>`;
        });
        html += '</tr>';
    });
    similarityTable.innerHTML = html + '</tbody>';
    overallScore.textContent = count ? `Final overall similarity score: ${(total / count).toFixed(2)}%` : '';
}

function buildSharedSentenceMap(entries) {
    const map = new Map();
    entries.forEach(({ text, index }) => {
        const unique = new Set(splitSentences(text).map((s) => s.toLowerCase()));
        unique.forEach((s) => {
            if (!map.has(s)) map.set(s, new Set());
            map.get(s).add(index);
        });
    });
    return [...map.entries()].filter(([, docs]) => docs.size >= 2 && docs.size <= 4).sort((a, b) => b[0].length - a[0].length);
}


function collectSharedPhrases(entries, n = 3) {
    const phraseMap = new Map();
    entries.forEach(({ text, index }) => {
        const words = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
        const seen = new Set();
        for (let i = 0; i <= words.length - n; i += 1) {
            const phrase = words.slice(i, i + n).join(' ');
            if (seen.has(phrase)) {
                continue;
            }
            seen.add(phrase);
            if (!phraseMap.has(phrase)) phraseMap.set(phrase, new Set());
            phraseMap.get(phrase).add(index);
        }
    });
    return [...phraseMap.entries()]
        .filter(([, docs]) => docs.size >= 2)
        .sort((a, b) => b[1].size - a[1].size || b[0].length - a[0].length)
        .slice(0, 12);
}

function renderMatchSummary(entries, sharedSentences) {
    const sharedPhrases = collectSharedPhrases(entries, 3);
    const sentenceItems = sharedSentences.slice(0, 8);

    if (!sentenceItems.length && !sharedPhrases.length) {
        matchLegend.innerHTML = '<p class="muted">No repeated sentences or phrases found across documents.</p>';
        matchList.innerHTML = '';
        matchResults.hidden = false;
        return;
    }

    matchLegend.innerHTML = sentenceItems
        .map(([sentence, docs], i) => {
            const cls = HIGHLIGHT_CLASSES[i % HIGHLIGHT_CLASSES.length];
            const docNames = [...docs].map((doc) => `Text ${doc + 1}`).join(', ');
            return `<span class="legend-chip ${cls}">${escapeHtml(sentence.slice(0, 80))}${sentence.length > 80 ? '…' : ''} · ${docNames}</span>`;
        })
        .join('');

    matchList.innerHTML = sharedPhrases.length
        ? `<h3>Top shared phrases (3-word)</h3><ul>${sharedPhrases.map(([phrase, docs]) => `<li><strong>${escapeHtml(phrase)}</strong> — in ${[...docs].map((d) => `Text ${d + 1}`).join(', ')}</li>`).join('')}</ul>`
        : '<p class="muted">No repeated 3-word phrases found across documents.</p>';

    matchResults.hidden = false;
}

function renderHighlights(entries) {
    const sharedSentences = buildSharedSentenceMap(entries);
    previews.forEach((preview) => { preview.innerHTML = '<p class="muted">No highlights yet.</p>'; });

    entries.forEach(({ text, index }) => {
        let highlighted = escapeHtml(text);
        sharedSentences.forEach(([sentence, docs], i) => {
            if (!docs.has(index)) return;
            const cls = HIGHLIGHT_CLASSES[i % HIGHLIGHT_CLASSES.length];
            const safe = escapeHtml(sentence);
            const pattern = new RegExp(safe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            highlighted = highlighted.replace(pattern, `<mark class="${cls}">$&</mark>`);
        });
        previews[index].innerHTML = highlighted || '<p class="muted">No text provided.</p>';
    });

    return sharedSentences;
}

function runBasicGrammarChecks(text, label) {
    const issues = []; const lines = text.split(/\n+/);
    lines.forEach((line, i) => {
        const t = line.trim(); if (!t) return;
        if (!/^[A-Z"'(\[]/.test(t)) issues.push(`${label}: Line ${i + 1} may need capitalization at the start.`);
        if (!/[.!?]$/.test(t)) issues.push(`${label}: Line ${i + 1} may be missing end punctuation.`);
        if (/\s{2,}/.test(line)) issues.push(`${label}: Line ${i + 1} has repeated spaces.`);
        const rep = t.match(/\b(\w+)\s+\1\b/i); if (rep) issues.push(`${label}: Line ${i + 1} repeats the word "${rep[1]}".`);
    });
    if ((text.match(/"/g) || []).length % 2 !== 0) issues.push(`${label}: Possible unbalanced double quotation marks.`);
    if ((text.match(/\(/g) || []).length !== (text.match(/\)/g) || []).length) issues.push(`${label}: Possible unbalanced parentheses.`);
    const sent = splitSentences(text);
    sent.forEach((sentence, i) => {
        if (sentence.split(/\s+/).length > 35) issues.push(`${label}: Sentence ${i + 1} is very long; consider splitting it for clarity.`);
        if (/\b(am|is|are|was|were|be|been|being)\s+\w+ed\b/i.test(sentence) && /\bby\b/i.test(sentence)) {
            issues.push(`${label}: Sentence ${i + 1} may use passive voice ("${sentence.slice(0, 70)}${sentence.length > 70 ? '…' : ''}").`);
        }
        if (/\b(very|really|quite|just|actually)\b.*\b(very|really|quite|just|actually)\b/i.test(sentence)) {
            issues.push(`${label}: Sentence ${i + 1} repeats weak modifiers (e.g., very/really/just).`);
        }
    });
    const commonConfusions = [
        [/\byour welcome\b/i, `Use "you're welcome" instead of "your welcome".`],
        [/\bits a\b/i, `Check if "it's" (it is) is intended instead of "its".`],
        [/\bthere (is|are|was|were)\b[^.!?]{0,50}\btheir\b/i, 'Check there/their usage in the same clause.'],
        [/\bcould of\b/i, `Use "could have" instead of "could of".`],
        [/\bshould of\b/i, `Use "should have" instead of "should of".`],
    ];
    commonConfusions.forEach(([pattern, tip]) => { if (pattern.test(text)) issues.push(`${label}: ${tip}`); });
    return issues;
}

function renderGrammarResults(entries) {
    const grouped = entries.map(({ text, label }) => ({ label, issues: runBasicGrammarChecks(text, label) }));
    const issues = grouped.flatMap((item) => item.issues);

    grammarSummary.innerHTML = grouped
        .map((item) => {
            const issueCount = item.issues.length;
            const score = Math.max(0, 100 - (issueCount * 4));
            return `<p><strong>${item.label}</strong>: ${issueCount} issue(s) · Grammar score ${score}%</p>`;
        })
        .join('');

    grammarOutput.innerHTML = issues.length
        ? `<ul>${issues.map((x) => `<li>${x}</li>`).join('')}</ul>`
        : '<p>No obvious grammar issues found by the basic checker.</p>';
    grammarResults.hidden = false;
}

function analyzeSimilarity() {
    const entries = textAreas.map((a, i) => ({ text: a.value.trim(), label: `Text ${i + 1}`, index: i })).filter((e) => e.text);
    if (entries.length < 2) {
        resultsSection.hidden = true; grammarResults.hidden = true; matchResults.hidden = true; overallScore.textContent = '';
        setStatus('Please add content in at least two text boxes before analyzing.', 'error'); return;
    }
    try {
        buildTable(entries); const sharedSentences = renderHighlights(entries); renderMatchSummary(entries, sharedSentences); renderGrammarResults(entries);
        similarityPanel?.classList.add('preview-only');
        resultsSection.hidden = false;
        setStatus(`Analysis complete for ${entries.length} text(s). Shared sentences are color highlighted in each preview.`, 'success');
    } catch (error) {
        console.error(error);
        resultsSection.hidden = true; grammarResults.hidden = true; matchResults.hidden = true;
        setStatus('There was a problem while analyzing this input. Try shorter text or refresh and try again.', 'error');
    }
}

function clearAll() {
    textAreas.forEach((a) => { a.value = ''; }); uploadInputs.forEach((i) => { i.value = ''; });
    previews.forEach((p) => { p.innerHTML = ''; }); similarityTable.innerHTML = ''; grammarOutput.innerHTML = ''; grammarSummary.innerHTML = ''; matchLegend.innerHTML = ''; matchList.innerHTML = '';
    resultsSection.hidden = true; grammarResults.hidden = true; matchResults.hidden = true; overallScore.textContent = '';
    similarityPanel?.classList.remove('preview-only');
    setStatus('All text inputs cleared.', 'idle');
}

async function parseFileContent(file) {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (['txt', 'md', 'csv'].includes(ext) || file.type.startsWith('text/')) return file.text();
    throw new Error('Only .txt, .md, and .csv files are supported for upload.');
}

uploadInputs.forEach((input) => input.addEventListener('change', async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
        const fileText = await parseFileContent(file); const idx = Number(input.dataset.index); textAreas[idx].value = fileText;
        setStatus(`${file.name} loaded into Text ${idx + 1}.`, 'success');
    } catch (error) {
        setStatus(`Could not read ${file.name}. ${error?.message || 'Try a different file.'}`, 'error');
    }
}));

analyzeButton.addEventListener('click', analyzeSimilarity);
clearButton.addEventListener('click', clearAll);
