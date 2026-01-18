// RSVP Display Engine
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// State
const state = {
  words: [],
  currentIndex: 0,
  isPlaying: false,
  wpm: 300,
  intervalId: null
};

// Test text
const TEST_TEXT = "The quick brown fox jumps over the lazy dog. This is a test of the speed reading system.";

/**
 * Calculate the Optimal Recognition Point (ORP) index for a word.
 * ORP is typically around 35% from the left of the word.
 * @param {string} word - The word to calculate ORP for
 * @returns {number} - The index of the ORP letter
 */
function calculateORP(word) {
  if (word.length <= 1) return 0;
  if (word.length <= 3) return 0;
  return Math.max(0, Math.floor(word.length * 0.35) - 1);
}

/**
 * Render a word with ORP highlighting in the display element.
 * @param {string} word - The word to display
 */
function displayWord(word) {
  const display = document.getElementById('word-display');
  if (!word || word.length === 0) {
    display.innerHTML = '';
    return;
  }

  const orpIndex = calculateORP(word);
  const before = word.substring(0, orpIndex);
  const orp = word.charAt(orpIndex);
  const after = word.substring(orpIndex + 1);

  display.innerHTML = `<span class="word-before">${before}</span><span class="orp">${orp}</span><span class="word-after">${after}</span>`;
}

/**
 * Split text into words array.
 * @param {string} text - Text to split
 * @returns {string[]} - Array of words
 */
function splitIntoWords(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0);
}

/**
 * Calculate delay between words in milliseconds.
 * @param {number} wpm - Words per minute
 * @returns {number} - Delay in milliseconds
 */
function calculateDelay(wpm) {
  return 60000 / wpm;
}

/**
 * Advance to next word and display it.
 */
function advanceWord() {
  if (state.words.length === 0) return;

  displayWord(state.words[state.currentIndex]);
  state.currentIndex++;

  // Loop back to start when finished
  if (state.currentIndex >= state.words.length) {
    state.currentIndex = 0;
  }
}

/**
 * Start playback.
 */
function play() {
  if (state.isPlaying) return;

  state.isPlaying = true;
  const delay = calculateDelay(state.wpm);

  // Show first word immediately
  advanceWord();

  state.intervalId = setInterval(advanceWord, delay);
}

/**
 * Pause playback.
 */
function pause() {
  if (!state.isPlaying) return;

  state.isPlaying = false;
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
}

/**
 * Load text and prepare for playback.
 * @param {string} text - Text to load
 */
function loadText(text) {
  state.words = splitIntoWords(text);
  state.currentIndex = 0;
}

/**
 * Parse PDF buffer and extract text.
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text
 */
async function parsePDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

/**
 * Parse Word document buffer and extract text.
 * @param {Buffer} buffer - .docx file buffer
 * @returns {Promise<string>} - Extracted text
 */
async function parseDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Handle dropped file - extract text and load into RSVP.
 * @param {File} file - Dropped file object
 */
async function handleDroppedFile(file) {
  const filePath = file.path;
  const ext = window.fileAPI.getExtension(filePath);

  try {
    const buffer = window.fileAPI.readFile(filePath);
    let text;

    switch (ext) {
      case '.pdf':
        text = await parsePDF(buffer);
        break;
      case '.docx':
        text = await parseDocx(buffer);
        break;
      case '.txt':
        text = buffer.toString('utf-8');
        break;
      default:
        alert(`Unsupported file format: ${ext}\nSupported formats: .pdf, .docx, .txt`);
        return;
    }

    if (!text || text.trim().length === 0) {
      alert('No text found in document. The file may be empty or contain only images.');
      return;
    }

    loadText(text);
    play();
    document.getElementById('drop-zone').classList.add('playing');
  } catch (error) {
    alert(`Error reading file: ${error.message}`);
  }
}

// Drag and drop event handlers
const dropZone = document.getElementById('drop-zone');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', async (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');

  const file = e.dataTransfer.files[0];
  if (file) {
    await handleDroppedFile(file);
  }
});

// Initialize on load - show drop zone, don't auto-play test text
document.addEventListener('DOMContentLoaded', () => {
  // Ready for file drop
});
