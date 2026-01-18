// RSVP Display Engine

// State
const state = {
  words: [],
  currentIndex: 0,
  isPlaying: false,
  wpm: 300,
  intervalId: null,
  fontSize: 48
};

// Test text
const TEST_TEXT = "The quick brown fox jumps over the lazy dog. This is a test of the speed reading system.";

/**
 * Calculate the Optimal Recognition Point (ORP) index for a word.
 * ORP is positioned ~40% into the word for comfortable reading.
 * @param {string} word - The word to calculate ORP for
 * @returns {number} - The index of the ORP letter
 */
function calculateORP(word) {
  if (word.length <= 1) return 0;
  if (word.length <= 3) return 1;
  if (word.length <= 5) return 1;
  return Math.floor(word.length * 0.4);
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

  // Measure ORP character width and adjust positioning
  const orpEl = display.querySelector('.orp');
  const beforeEl = display.querySelector('.word-before');
  const afterEl = display.querySelector('.word-after');

  const orpWidth = orpEl.offsetWidth;
  const halfOrp = orpWidth / 2;

  beforeEl.style.right = `calc(50% + ${halfOrp}px)`;
  afterEl.style.left = `calc(50% + ${halfOrp}px)`;
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
 * Set playback speed (WPM).
 * @param {number} wpm - Words per minute (clamped to 100-1000)
 */
function setSpeed(wpm) {
  state.wpm = Math.max(100, Math.min(1000, wpm));
  showIndicator(`${state.wpm} WPM`);

  // If playing, restart interval with new delay
  if (state.isPlaying) {
    clearInterval(state.intervalId);
    const delay = calculateDelay(state.wpm);
    state.intervalId = setInterval(advanceWord, delay);
  }
}

/**
 * Set font size for word display.
 * @param {number} size - Font size in pixels (clamped to 24-96)
 */
function setFontSize(size) {
  state.fontSize = Math.max(24, Math.min(96, size));
  const display = document.getElementById('word-display');
  display.style.fontSize = `${state.fontSize}px`;
  // Scale container height proportionally (1.25x font size)
  display.style.height = `${state.fontSize * 1.25}px`;
  showIndicator(`${state.fontSize}px`);
}

/**
 * Show a brief indicator message at bottom of screen.
 * @param {string} message - Message to display
 */
function showIndicator(message) {
  let indicator = document.getElementById('speed-indicator');

  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'speed-indicator';
    document.body.appendChild(indicator);
  }

  indicator.textContent = message;
  indicator.classList.add('visible');

  // Clear any existing timeout
  if (indicator.timeoutId) {
    clearTimeout(indicator.timeoutId);
  }

  // Fade out after 1 second
  indicator.timeoutId = setTimeout(() => {
    indicator.classList.remove('visible');
  }, 1000);
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
 * Show loading state in word display.
 * @param {string} message - Loading message to show
 */
function showLoading(message) {
  const display = document.getElementById('word-display');
  display.innerHTML = `<span style="color: rgba(255,255,255,0.5); font-size: 24px;">${message}</span>`;
}

/**
 * Handle URL - fetch and extract article text.
 * @param {string} url - URL to fetch
 */
async function handleURL(url) {
  showLoading('Loading...');

  try {
    const text = await window.fileAPI.fetchURL(url);

    if (!text || text.trim().length === 0) {
      alert('No article content found at this URL.');
      document.getElementById('word-display').innerHTML = '';
      return;
    }

    loadText(text);
    play();
    document.getElementById('drop-zone').classList.add('playing');
  } catch (error) {
    alert(`Error fetching URL: ${error.message}`);
    document.getElementById('word-display').innerHTML = '';
  }
}

/**
 * Handle dropped file - extract text and load into RSVP.
 * @param {File} file - Dropped file object
 */
async function handleDroppedFile(file) {
  const filePath = window.fileAPI.getPathForFile(file);

  if (!filePath) {
    alert('Could not get file path. Try dragging the file directly from File Explorer.');
    return;
  }

  const ext = await window.fileAPI.getExtension(filePath);

  try {
    let text;

    switch (ext) {
      case '.pdf':
        text = await window.fileAPI.parsePDF(filePath);
        break;
      case '.docx':
        text = await window.fileAPI.parseDocx(filePath);
        break;
      case '.txt':
        text = await window.fileAPI.readTextFile(filePath);
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

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');

  console.log('Drop zone element:', dropZone);

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        if (state.isPlaying) {
          pause();
        } else {
          play();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSpeed(state.wpm + 50);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSpeed(state.wpm - 50);
        break;
      case 'Equal': // + key (=/+)
      case 'NumpadAdd':
        e.preventDefault();
        setFontSize(state.fontSize + 8);
        break;
      case 'Minus': // - key
      case 'NumpadSubtract':
        e.preventDefault();
        setFontSize(state.fontSize - 8);
        break;
    }
  });

  // Prevent default drag behavior on document and allow drops
  document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });

  document.addEventListener('drop', (e) => {
    e.preventDefault();
  });

  document.addEventListener('dragenter', (e) => {
    e.preventDefault();
  });

  // Drop zone events
  dropZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    dropZone.classList.add('dragover');
    console.log('dragenter');
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    console.log('dragover');
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    console.log('dragleave');
  });

  dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    console.log('drop event fired');

    // Check for dropped file first
    const file = e.dataTransfer.files[0];
    console.log('Dropped file:', file);
    if (file) {
      await handleDroppedFile(file);
      return;
    }

    // Check for dropped text (URL)
    const text = e.dataTransfer.getData('text/plain');
    console.log('Dropped text:', text);
    if (text && await window.fileAPI.isURL(text)) {
      await handleURL(text);
    }
  });

  // Paste handler for URLs
  document.addEventListener('paste', async (e) => {
    const text = e.clipboardData.getData('text/plain');
    console.log('Pasted text:', text);
    if (text && await window.fileAPI.isURL(text)) {
      e.preventDefault();
      await handleURL(text);
    }
  });

  console.log('Event listeners attached');
});
