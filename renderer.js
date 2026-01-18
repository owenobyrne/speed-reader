// RSVP Display Engine

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

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  loadText(TEST_TEXT);
  play();
});
