// Get DOM elements
const textInput = document.getElementById('textInput');
const searchInput = document.getElementById('searchInput');
const highlightedText = document.getElementById('highlightedText');
const searchInfo = document.getElementById('searchInfo');

// Event listeners
textInput.addEventListener('input', updateStatistics);

// Colors for different keywords
const highlightColors = ['highlight-1', 'highlight-2', 'highlight-3', 'highlight-4', 'highlight-5'];

/**
 * Update all statistics in real-time
 */
function updateStatistics() {
    const text = textInput.value;

    // Count words
    const words = countWords(text);
    document.getElementById('wordCount').textContent = words;

    // Count characters
    const chars = text.length;
    document.getElementById('charCount').textContent = chars;

    // Count sentences
    const sentences = countSentences(text);
    document.getElementById('sentenceCount').textContent = sentences;

    // Count paragraphs
    const paragraphs = countParagraphs(text);
    document.getElementById('paragraphCount').textContent = paragraphs;

    // Average words per sentence
    const avgWords = sentences > 0 ? (words / sentences).toFixed(2) : 0;
    document.getElementById('avgWords').textContent = avgWords;

    // Average characters per word
    const avgChars = words > 0 ? (chars / words).toFixed(2) : 0;
    document.getElementById('avgChars').textContent = avgChars;
}

/**
 * Count words in text
 */
function countWords(text) {
    const trimmed = text.trim();
    if (trimmed.length === 0) return 0;
    return trimmed.split(/\s+/).length;
}

/**
 * Count sentences in text
 */
function countSentences(text) {
    if (text.trim().length === 0) return 0;
    // Match sentence endings: . ! ? followed by space or end of string
    const sentences = text.match(/[.!?]+(\s|$)/g);
    return sentences ? sentences.length : 0;
}

/**
 * Count paragraphs in text
 */
function countParagraphs(text) {
    if (text.trim().length === 0) return 0;
    // Split by double newlines to identify paragraphs
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    return paragraphs.length;
}

/**
 * Search and highlight keywords across the entire text
 * Handles multiple keywords in separate sentences/paragraphs
 */
function searchKeywords() {
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        searchInfo.textContent = 'Please enter keywords to search.';
        highlightedText.textContent = 'Please enter keywords to search.';
        return;
    }

    const text = textInput.value;
    if (!text) {
        searchInfo.textContent = 'Please paste text first.';
        highlightedText.textContent = 'Please paste text first.';
        return;
    }

    // Parse keywords (comma-separated)
    const keywords = searchTerm.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
    
    if (keywords.length === 0) {
        searchInfo.textContent = 'Please enter valid keywords.';
        return;
    }

    // Count occurrences of each keyword
    const keywordCounts = {};
    let totalMatches = 0;

    keywords.forEach((keyword, index) => {
        // Case-insensitive search using word boundaries
        const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'gi');
        const matches = text.match(regex) || [];
        keywordCounts[keyword] = matches.length;
        totalMatches += matches.length;
    });

    // Highlight text with color coding
    let highlightedContent = text;

    // Sort keywords by length (longest first) to avoid overlapping replacements
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);

    sortedKeywords.forEach((keyword, index) => {
        const colorClass = highlightColors[index % highlightColors.length];
        const regex = new RegExp(`\\b(${escapeRegExp(keyword)})\\b`, 'gi');
        highlightedContent = highlightedContent.replace(regex, `<span class="${colorClass}">$1</span>`);
    });

    highlightedText.innerHTML = highlightedContent;

    // Display search info
    const infoText = `Found ${totalMatches} match${totalMatches !== 1 ? 'es' : ''} for ${keywords.length} keyword${keywords.length !== 1 ? 's' : ''}: ` +
        keywords.map((kw, i) => `<strong style="background-color: ${getHighlightColor(i)}; padding: 2px 6px; border-radius: 3px; color: ${getTextColor(i)};">${kw}</strong> (${keywordCounts[kw]})`).join(', ');
    
    searchInfo.innerHTML = infoText;
}

/**
 * Get highlight color for index
 */
function getHighlightColor(index) {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#A8E6CF'];
    return colors[index % colors.length];
}

/**
 * Get text color based on background
 */
function getTextColor(index) {
    const textColors = ['#333', 'white', 'white', '#333', '#333'];
    return textColors[index % textColors.length];
}

/**
 * Clear highlighted text and search
 */
function clearHighlight() {
    searchInput.value = '';
    searchInfo.textContent = '';
    highlightedText.textContent = 'Enter keywords and click "Search" to see highlighted results...';
}

/**
 * Clear text input
 */
function clearText() {
    textInput.value = '';
    updateStatistics();
    clearHighlight();
}

/**
 * Copy text to clipboard
 */
function copyText() {
    text = textInput.value;
    if (!text) {
        alert('No text to copy!');
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(() => {
        alert('Failed to copy text.');
    });
}

/**
 * Calculate keyword density
 */
function calculateDensity() {
    const text = textInput.value;
    
    if (!text) {
        document.getElementById('densityResults').innerHTML = '<p class="placeholder-text">Please paste text first.</p>';
        return;
    }

    const minOccurrences = parseInt(document.getElementById('minOccurrences').value) || 2;

    // Extract all words and clean them
    const words = text.toLowerCase()
        .match(/\b[a-z0-9]+(?:'[a-z]+)?\b/g) || [];

    if (words.length === 0) {
        document.getElementById('densityResults').innerHTML = '<p class="placeholder-text">No words found in text.</p>';
        return;
    }

    // Count word frequencies
    const wordFrequency = {};
    words.forEach(word => {
        // Skip common stop words
        if (!isStopWord(word)) {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        }
    });

    // Filter by minimum occurrences
    const filteredWords = Object.entries(wordFrequency)
        .filter(([word, count]) => count >= minOccurrences)
        .sort((a, b) => b[1] - a[1]);

    if (filteredWords.length === 0) {
        document.getElementById('densityResults').innerHTML = 
            `<p class="placeholder-text">No keywords found with at least ${minOccurrences} occurrences. Try lowering the minimum.</p>`;
        return;
    }

    // Calculate total word count (excluding stop words)
    const totalWords = Object.values(wordFrequency).reduce((a, b) => a + b, 0);

    // Generate HTML
    let html = '';
    const maxCount = Math.max(...filteredWords.map(([_, count]) => count));

    filteredWords.slice(0, 25).forEach(([word, count]) => {
        const density = ((count / totalWords) * 100).toFixed(2);
        const barWidth = (count / maxCount) * 100;

        html += `
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
    });

    document.getElementById('densityResults').innerHTML = html;
}

/**
 * Common English stop words to exclude from density analysis
 */
function isStopWord(word) {
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'from', 'up', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
        'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your',
        'his', 'her', 'its', 'our', 'their', 'what', 'which', 'who', 'when', 'where', 'why', 'how',
        'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
        'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'as', 'if', 'just', 'there', 'here'
    ]);
    return stopWords.has(word);
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStatistics();
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
