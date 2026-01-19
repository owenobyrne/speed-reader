// RSVP Display Engine

// State
const state = {
  words: [],
  currentIndex: 0,
  isPlaying: false,
  wpm: 300,
  timeoutId: null,          // Changed from intervalId for dynamic per-word scheduling
  fontSize: 48,
  sourceText: '',           // Original full text for boundary detection
  sourceId: '',             // Identifier for position saving (filename or URL)
  sentenceStarts: [],       // Word indices where sentences begin
  paragraphStarts: [],      // Word indices where paragraphs begin
  // Navigation state for quick-tap detection
  lastNavTime: 0,           // Timestamp of last navigation
  lastNavBoundaryIdx: -1,   // Boundary index we last jumped to
  navTapThreshold: 500,     // ms threshold for "quick" successive taps
  // Timing mode: 0=pure WPM, 1=punctuation-only, 2=length+punctuation
  timingMode: 2,
  // Font options with per-font adjustments to normalize visual size and alignment
  // scale: compensates for different x-heights across fonts
  // offset: vertical adjustment in em units (positive = down, from font metrics)
  fonts: [
    { name: 'Times New Roman', scale: 1.0, offset: 0 },
    { name: 'Tinos', scale: 1.0, offset: 0 },                    // Reference font
    { name: 'EB Garamond', scale: 1.12, offset: 0.116 },         // asc 1007 vs 891
    { name: 'Merriweather', scale: 0.92, offset: 0.093 },        // asc 984 vs 891
    { name: 'Libre Baskerville', scale: 0.95, offset: 0.079 },   // asc 970 vs 891
    { name: 'Spectral', scale: 1.02, offset: 0.168 }             // asc 1059 vs 891
  ],
  currentFontIndex: 0,
  // Context words: show previous/next words dimly for parafoveal preview
  showContext: true,
  contextWordCount: 2,      // Number of words to show on each side
  // WPS tracking
  wpsStartTime: null,       // When reading started (for WPS calculation)
  wpsStartIndex: 0,         // Word index when reading started
  currentWPS: 0             // Current words per second
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
 * Get context words (previous and next) for the current position.
 * @param {number} index - Current word index
 * @returns {object} - { prev: string[], next: string[] }
 */
function getContextWords(index) {
  const count = state.contextWordCount;
  const prev = [];
  const next = [];

  // Get previous words
  for (let i = count; i >= 1; i--) {
    const idx = index - i;
    if (idx >= 0 && idx < state.words.length) {
      prev.push(state.words[idx]);
    }
  }

  // Get next words
  for (let i = 1; i <= count; i++) {
    const idx = index + i;
    if (idx >= 0 && idx < state.words.length) {
      next.push(state.words[idx]);
    }
  }

  return { prev, next };
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

  // Build the main word HTML
  const mainWordHtml = `<span class="word-wrapper"><span class="word-before">${before}</span><span class="orp">${orp}</span><span class="word-after">${after}</span></span>`;

  // Build context words HTML if enabled
  let html;
  if (state.showContext) {
    const context = getContextWords(state.currentIndex);
    const prevText = context.prev.join(' ');
    const nextText = context.next.join(' ');

    html = `<div class="context-container">
      <span class="context-words prev">${prevText}</span>
      <span class="main-word-container">${mainWordHtml}</span>
      <span class="context-words next">${nextText}</span>
    </div>`;
  } else {
    html = mainWordHtml;
  }

  // Fade out before changing content
  display.style.opacity = '0';

  // Use requestAnimationFrame to ensure opacity change is applied before content swap
  requestAnimationFrame(() => {
    display.innerHTML = html;

    // Fade back in
    requestAnimationFrame(() => {
      display.style.opacity = '1';
    });
  });
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
 * Calculate base delay between words in milliseconds.
 * @param {number} wpm - Words per minute
 * @returns {number} - Delay in milliseconds
 */
function calculateDelay(wpm) {
  return 60000 / wpm;
}

/**
 * Calculate variable delay for a specific word based on length and punctuation.
 * Respects state.timingMode: 0=pure WPM, 1=punctuation-only, 2=length+punctuation
 * @param {string} word - The word to calculate delay for
 * @param {number} baseDelay - Base delay from WPM setting
 * @returns {number} - Adjusted delay in milliseconds
 */
function calculateWordDelay(word, baseDelay) {
  if (!word || word.length === 0) return baseDelay;

  // Mode 0: Pure WPM - no adjustments
  if (state.timingMode === 0) {
    return baseDelay;
  }

  // Length adjustment: add 15% per character above 6 chars (mode 2 only)
  let lengthMultiplier = 1;
  if (state.timingMode === 2) {
    const extraChars = Math.max(0, word.length - 6);
    lengthMultiplier = 1 + (extraChars * 0.15);
  }

  // Punctuation bonus: check word ending (modes 1 and 2)
  let punctuationBonus = 0;
  const lastChar = word.charAt(word.length - 1);

  if ('.!?'.includes(lastChar)) {
    // Sentence-ending punctuation: 50% bonus
    punctuationBonus = 0.5;
  } else if (',;:'.includes(lastChar)) {
    // Pause punctuation: 25% bonus
    punctuationBonus = 0.25;
  }

  // Calculate final delay
  let delay = baseDelay * lengthMultiplier + baseDelay * punctuationBonus;

  // Cap at 3x base delay to prevent extreme pauses
  return Math.min(delay, baseDelay * 3);
}

/**
 * Update progress bar to reflect current position.
 */
function updateProgress() {
  const progressFill = document.getElementById('progress-fill');
  if (!progressFill || state.words.length === 0) return;

  const progress = (state.currentIndex / state.words.length) * 100;
  progressFill.style.width = `${progress}%`;

  // Also update position indicator
  updatePositionIndicator();
}

/**
 * Advance to next word and display it, then schedule the next advance.
 * Uses setTimeout chaining for variable per-word timing.
 */
function advanceWord() {
  if (state.words.length === 0) return;

  const currentWord = state.words[state.currentIndex];
  displayWord(currentWord);
  state.currentIndex++;
  updateProgress();

  // Stop at end instead of looping
  if (state.currentIndex >= state.words.length) {
    state.currentIndex = state.words.length; // Mark as finished (past last word)
    // Show last word for its full duration, then clear and pause
    const baseDelay = calculateDelay(state.wpm);
    const wordDelay = calculateWordDelay(currentWord, baseDelay);
    setTimeout(() => {
      pause();
      document.getElementById('word-display').innerHTML = '';
    }, wordDelay);
    return;
  }

  // Schedule next word with variable delay based on current word
  if (state.isPlaying) {
    const baseDelay = calculateDelay(state.wpm);
    const wordDelay = calculateWordDelay(currentWord, baseDelay);
    state.timeoutId = setTimeout(advanceWord, wordDelay);
  }
}

/**
 * Start playback.
 * Uses setTimeout chaining via advanceWord for variable per-word timing.
 */
function play() {
  if (state.isPlaying) return;

  state.isPlaying = true;

  // Initialize WPS tracking
  state.wpsStartTime = Date.now();
  state.wpsStartIndex = state.currentIndex;

  // Show first word immediately - advanceWord will chain subsequent calls
  advanceWord();
}

/**
 * Pause playback.
 */
function pause() {
  if (!state.isPlaying) return;

  state.isPlaying = false;
  if (state.timeoutId) {
    clearTimeout(state.timeoutId);
    state.timeoutId = null;
  }

  // Save position when pausing
  savePosition();
}

/**
 * Jump to a specific word index and display it.
 * @param {number} index - Target word index
 */
function jumpToIndex(index) {
  if (state.words.length === 0) return;

  // Clamp index to valid range - playback continues from new position if playing
  state.currentIndex = Math.max(0, Math.min(index, state.words.length - 1));
  displayWord(state.words[state.currentIndex]);
  updateProgress();
}

/**
 * Find which boundary index we're currently at or past.
 * @param {number[]} starts - Array of boundary word indices
 * @returns {number} - Index into the starts array
 */
function findCurrentBoundaryIndex(starts) {
  for (let i = starts.length - 1; i >= 0; i--) {
    if (starts[i] <= state.currentIndex) {
      return i;
    }
  }
  return 0;
}

/**
 * Navigate backward through boundaries with quick-tap support.
 * - Single tap (or after delay): go to start of current boundary
 * - Quick successive taps: go back one more each time
 * @param {number[]} starts - Array of boundary word indices
 * @param {string} type - 'sentence' or 'paragraph' for tracking
 */
function navigateBack(starts, type) {
  if (state.words.length === 0 || starts.length === 0) return;

  const now = Date.now();
  const isQuickTap = (now - state.lastNavTime) < state.navTapThreshold;
  const currentBoundaryIdx = findCurrentBoundaryIndex(starts);

  let targetIdx;
  if (isQuickTap && state.lastNavBoundaryIdx >= 0) {
    // Quick tap: go back one more from where we last jumped
    targetIdx = Math.max(0, state.lastNavBoundaryIdx - 1);
  } else {
    // First tap or after delay: go to start of current boundary
    targetIdx = currentBoundaryIdx;
  }

  state.lastNavTime = now;
  state.lastNavBoundaryIdx = targetIdx;
  jumpToIndex(starts[targetIdx]);
}

/**
 * Navigate forward through boundaries.
 * @param {number[]} starts - Array of boundary word indices
 */
function navigateForward(starts) {
  if (state.words.length === 0 || starts.length === 0) return;

  const currentIdx = findCurrentBoundaryIndex(starts);
  const targetIdx = Math.min(starts.length - 1, currentIdx + 1);

  // Reset quick-tap state on forward navigation
  state.lastNavTime = 0;
  state.lastNavBoundaryIdx = -1;

  jumpToIndex(starts[targetIdx]);
}

/**
 * Jump back to previous sentence start.
 * Single tap: restart current sentence. Quick taps: go back further.
 */
function jumpBackSentence() {
  navigateBack(state.sentenceStarts, 'sentence');
}

/**
 * Jump forward to next sentence start.
 */
function jumpForwardSentence() {
  navigateForward(state.sentenceStarts);
}

/**
 * Jump back to previous paragraph start.
 * Single tap: restart current paragraph. Quick taps: go back further.
 */
function jumpBackParagraph() {
  navigateBack(state.paragraphStarts, 'paragraph');
}

/**
 * Jump forward to next paragraph start.
 */
function jumpForwardParagraph() {
  navigateForward(state.paragraphStarts);
}

/**
 * Set playback speed (WPM).
 * @param {number} wpm - Words per minute (clamped to 100-1000)
 */
function setSpeed(wpm) {
  state.wpm = Math.max(100, Math.min(1000, wpm));
  updateWPMDisplay();
  showIndicator(`${state.wpm} WPM`);

  // Save WPM preference to localStorage
  try {
    localStorage.setItem('speed-reader-wpm', state.wpm.toString());
  } catch (e) {
    console.warn('Could not save WPM preference:', e);
  }

  // If playing, clear current timeout - next advanceWord call will use new WPM
  if (state.isPlaying && state.timeoutId) {
    clearTimeout(state.timeoutId);
    // Immediately schedule next word with new speed
    advanceWord();
  }
}

/**
 * Set font size for word display.
 * @param {number} size - Font size in pixels (clamped to 24-96)
 */
function setFontSize(size) {
  state.fontSize = Math.max(24, Math.min(96, size));
  const display = document.getElementById('word-display');

  // Apply per-font scaling to normalize visual size
  const font = state.fonts[state.currentFontIndex];
  const scaledSize = Math.round(state.fontSize * font.scale);
  display.style.fontSize = `${scaledSize}px`;

  // Scale container height proportionally (1.25x font size)
  display.style.height = `${state.fontSize * 1.25}px`;

  // Update logo display to match
  const logoDisplay = document.getElementById('logo-display');
  if (logoDisplay) {
    logoDisplay.style.fontSize = `${scaledSize}px`;
  }

  showIndicator(`${state.fontSize}px`);

  // Save font size preference to localStorage
  try {
    localStorage.setItem('speed-reader-font-size', state.fontSize.toString());
  } catch (e) {
    console.warn('Could not save font size preference:', e);
  }
}

/**
 * Cycle through timing modes: pure WPM -> punctuation-only -> length+punctuation
 */
function cycleTimingMode() {
  const modeNames = ['Pure WPM', 'Punctuation', 'Length+Punct'];
  state.timingMode = (state.timingMode + 1) % 3;
  showIndicator(modeNames[state.timingMode]);
}

/**
 * Set font by index and apply to display with per-font scaling and offset.
 * @param {number} index - Index into state.fonts array
 */
function setFont(index) {
  state.currentFontIndex = index;
  const font = state.fonts[index];
  const fontFamily = `'${font.name}', serif`;

  // Apply font family to body and word display
  document.body.style.fontFamily = fontFamily;
  const display = document.getElementById('word-display');
  display.style.fontFamily = fontFamily;

  // Apply per-font scaling to normalize visual size with guide lines
  const scaledSize = Math.round(state.fontSize * font.scale);
  display.style.fontSize = `${scaledSize}px`;

  // Apply vertical offset to align baselines (derived from font metrics)
  display.style.transform = font.offset ? `translateY(${font.offset}em)` : 'none';

  // Update logo display to match
  const logoDisplay = document.getElementById('logo-display');
  if (logoDisplay) {
    logoDisplay.style.fontFamily = fontFamily;
    logoDisplay.style.fontSize = `${scaledSize}px`;
    logoDisplay.style.transform = font.offset ? `translateY(${font.offset}em)` : 'none';
  }

  showIndicator(font.name);

  // Save preference to localStorage
  try {
    localStorage.setItem('speed-reader-font', index.toString());
  } catch (e) {
    console.warn('Could not save font preference:', e);
  }
}

/**
 * Cycle to next font in the fonts array.
 */
function cycleFont() {
  const nextIndex = (state.currentFontIndex + 1) % state.fonts.length;
  setFont(nextIndex);
}

/**
 * Toggle focus overlay (dark backdrop behind window).
 */
async function toggleFocusOverlay() {
  const isOn = await window.windowAPI.toggleFocusOverlay();
  showIndicator(isOn ? 'Focus Mode' : 'Focus Mode Off');
}

/**
 * Hide focus overlay (for Escape key).
 */
async function hideFocusOverlay() {
  await window.windowAPI.hideFocusOverlay();
  showIndicator('Focus Mode Off');
}

/**
 * Show focus overlay (for auto-show on content load).
 */
async function showFocusOverlay() {
  await window.windowAPI.showFocusOverlay();
}

/**
 * Toggle context words display on/off.
 */
function toggleContext() {
  state.showContext = !state.showContext;
  showIndicator(state.showContext ? 'Context On' : 'Context Off');

  // Save preference to localStorage
  try {
    localStorage.setItem('speed-reader-context', state.showContext.toString());
  } catch (e) {
    console.warn('Could not save context preference:', e);
  }

  // Re-render current word to show/hide context
  if (state.words.length > 0 && state.currentIndex < state.words.length) {
    displayWord(state.words[state.currentIndex]);
  }
}

/**
 * Show a brief indicator message in the info display.
 * @param {string} message - Message to display
 */
function showIndicator(message) {
  const infoText = document.getElementById('info-text');
  if (!infoText) return;

  const originalText = infoText.textContent;
  infoText.textContent = message;

  // Clear any existing timeout
  if (showIndicator.timeoutId) {
    clearTimeout(showIndicator.timeoutId);
  }

  // Restore original text after 1.5 seconds
  showIndicator.timeoutId = setTimeout(() => {
    // Only restore if still showing the indicator message
    if (infoText.textContent === message) {
      infoText.textContent = originalText;
    }
  }, 1500);
}

/**
 * Save current reading position to localStorage.
 * Only saves if there's a valid sourceId and content loaded.
 */
function savePosition() {
  if (!state.sourceId || state.words.length === 0) return;

  const key = `reading-position:${state.sourceId}`;
  const data = {
    index: state.currentIndex,
    timestamp: Date.now()
  };

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save reading position:', e);
  }
}

/**
 * Get saved reading position from localStorage.
 * @param {string} sourceId - The document identifier
 * @returns {number|null} - Saved word index, or null if not found/invalid
 */
function getSavedPosition(sourceId) {
  if (!sourceId) return null;

  const key = `reading-position:${sourceId}`;

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const data = JSON.parse(stored);
    if (typeof data.index === 'number' && data.index >= 0) {
      return data.index;
    }
  } catch (e) {
    console.warn('Could not retrieve reading position:', e);
  }

  return null;
}

/**
 * Update the position indicator display in info text.
 * No longer shows word count - just maintains default text.
 */
function updatePositionIndicator() {
  // Position indicator no longer displayed per user request
  // Info text remains static or shows temporary notifications
}

/**
 * Update the WPM display to show user's target WPM setting.
 */
function updateWPMDisplay() {
  const wpmValueElement = document.getElementById('wpm-value');
  if (!wpmValueElement) return;

  wpmValueElement.textContent = state.wpm.toString();
}

/**
 * Compute sentence and paragraph boundaries from source text.
 * Sentence starts: indices where a new sentence begins (after . ! ?)
 * Paragraph starts: indices where a new paragraph begins (after double newline)
 * @param {string} text - Original source text
 * @param {string[]} words - Array of words extracted from text
 */
function computeBoundaries(text, words) {
  const sentenceStarts = [0]; // First word is always a sentence start
  const paragraphStarts = [0]; // First word is always a paragraph start

  // Track character position in original text as we process words
  let charPos = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Find this word in text starting from current position
    const wordStart = text.indexOf(word, charPos);
    if (wordStart === -1) {
      charPos += word.length;
      continue;
    }

    // Check what's between the last position and this word
    const gap = text.substring(charPos, wordStart);

    // Check for paragraph break (double newline in gap)
    if (i > 0 && /\n\s*\n/.test(gap)) {
      if (!paragraphStarts.includes(i)) {
        paragraphStarts.push(i);
      }
      // Paragraph start is also a sentence start
      if (!sentenceStarts.includes(i)) {
        sentenceStarts.push(i);
      }
    }

    // Check if previous word ended with sentence-ending punctuation
    if (i > 0) {
      const prevWord = words[i - 1];
      if (/[.!?]["']?$/.test(prevWord)) {
        if (!sentenceStarts.includes(i)) {
          sentenceStarts.push(i);
        }
      }
    }

    charPos = wordStart + word.length;
  }

  // Sort the arrays to ensure they're in order
  sentenceStarts.sort((a, b) => a - b);
  paragraphStarts.sort((a, b) => a - b);

  return { sentenceStarts, paragraphStarts };
}

/**
 * Load text and prepare for playback.
 * @param {string} text - Text to load
 */
function loadText(text) {
  state.sourceText = text;
  state.words = splitIntoWords(text);
  state.currentIndex = 0;

  // Compute sentence and paragraph boundaries
  const boundaries = computeBoundaries(text, state.words);
  state.sentenceStarts = boundaries.sentenceStarts;
  state.paragraphStarts = boundaries.paragraphStarts;

  updateProgress(); // Reset progress bar
}

/**
 * Show loading state in word display with animated spinner.
 * @param {string} message - Loading message to show
 */
function showLoading(message) {
  const display = document.getElementById('word-display');
  display.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">${message}</div>
    </div>
  `;
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

    // Set sourceId to the URL for position persistence
    state.sourceId = url;

    loadText(text);

    // Check for saved position and restore if valid
    const savedPosition = getSavedPosition(state.sourceId);
    if (savedPosition !== null && savedPosition < state.words.length) {
      state.currentIndex = savedPosition;
      updateProgress();
    }

    play();
    document.getElementById('drop-zone').classList.add('playing');
    showFocusOverlay();
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
  // Log file details for debugging
  console.log('handleDroppedFile - File object:', {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified
  });

  const filePath = window.fileAPI.getPathForFile(file);
  console.log('handleDroppedFile - File path:', filePath);

  if (!filePath) {
    alert('Could not get file path. Try dragging the file directly from File Explorer.');
    return;
  }

  const ext = await window.fileAPI.getExtension(filePath);
  console.log('handleDroppedFile - Detected extension:', ext);

  // Show loading indicator (libraries may take time to load on first use)
  const filename = filePath.split(/[/\\]/).pop();
  showLoading(`Loading ${filename}...`);

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
        document.getElementById('word-display').innerHTML = '';
        console.error('Unsupported file format:', {
          extension: ext,
          mimetype: file.type,
          filename: file.name
        });
        alert(`Unsupported file format: ${ext}\nMIME type: ${file.type || 'unknown'}\nSupported formats: .pdf, .docx, .txt`);
        return;
    }

    if (!text || text.trim().length === 0) {
      document.getElementById('word-display').innerHTML = '';
      alert('No text found in document. The file may be empty or contain only images.');
      return;
    }

    // Set sourceId to filename for position persistence
    state.sourceId = filename;

    loadText(text);

    // Check for saved position and restore if valid
    const savedPosition = getSavedPosition(state.sourceId);
    if (savedPosition !== null && savedPosition < state.words.length) {
      state.currentIndex = savedPosition;
      updateProgress();
    }

    play();
    document.getElementById('drop-zone').classList.add('playing');
    showFocusOverlay();
  } catch (error) {
    document.getElementById('word-display').innerHTML = '';
    alert(`Error reading file: ${error.message}`);
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  // Window control button
  document.getElementById('close-btn').addEventListener('click', () => window.windowAPI.closeWindow());

  const dropZone = document.getElementById('drop-zone');

  console.log('Drop zone element:', dropZone);

  // Create progress bar inside bottom guide line
  const bottomGuideLine = document.querySelector('.guide-line.bottom');
  if (bottomGuideLine) {
    const progressFill = document.createElement('span');
    progressFill.id = 'progress-fill';
    bottomGuideLine.appendChild(progressFill);
  }

  // Restore font size preference from localStorage (before font, as font applies scaling)
  try {
    const savedFontSize = localStorage.getItem('speed-reader-font-size');
    if (savedFontSize !== null) {
      const size = parseInt(savedFontSize, 10);
      if (size >= 24 && size <= 96) {
        state.fontSize = size;
        // Also update container height
        const display = document.getElementById('word-display');
        display.style.height = `${state.fontSize * 1.25}px`;
      }
    }
  } catch (e) {
    console.warn('Could not restore font size preference:', e);
  }

  // Restore font preference from localStorage
  try {
    const savedFont = localStorage.getItem('speed-reader-font');
    if (savedFont !== null) {
      const fontIndex = parseInt(savedFont, 10);
      if (fontIndex >= 0 && fontIndex < state.fonts.length) {
        // Apply font without showing indicator on load
        state.currentFontIndex = fontIndex;
        const font = state.fonts[fontIndex];
        const fontFamily = `'${font.name}', serif`;
        document.body.style.fontFamily = fontFamily;
        const display = document.getElementById('word-display');
        display.style.fontFamily = fontFamily;
        // Apply per-font scaling
        const scaledSize = Math.round(state.fontSize * font.scale);
        display.style.fontSize = `${scaledSize}px`;
        // Apply vertical offset
        display.style.transform = font.offset ? `translateY(${font.offset}em)` : 'none';

        // Apply to logo display
        const logoDisplay = document.getElementById('logo-display');
        if (logoDisplay) {
          logoDisplay.style.fontFamily = fontFamily;
          logoDisplay.style.fontSize = `${scaledSize}px`;
          logoDisplay.style.transform = font.offset ? `translateY(${font.offset}em)` : 'none';
        }
      }
    }
  } catch (e) {
    console.warn('Could not restore font preference:', e);
  }

  // Restore WPM preference from localStorage
  try {
    const savedWpm = localStorage.getItem('speed-reader-wpm');
    if (savedWpm !== null) {
      const wpm = parseInt(savedWpm, 10);
      if (wpm >= 100 && wpm <= 1000) {
        state.wpm = wpm;
      }
    }
  } catch (e) {
    console.warn('Could not restore WPM preference:', e);
  }

  // Initialize WPM display
  updateWPMDisplay();

  // Initialize logo display (in case no saved font preference)
  const logoDisplay = document.getElementById('logo-display');
  if (logoDisplay) {
    const font = state.fonts[state.currentFontIndex];
    const fontFamily = `'${font.name}', serif`;
    const scaledSize = Math.round(state.fontSize * font.scale);
    logoDisplay.style.fontFamily = fontFamily;
    logoDisplay.style.fontSize = `${scaledSize}px`;
    logoDisplay.style.transform = font.offset ? `translateY(${font.offset}em)` : 'none';
  }

  // Restore context preference from localStorage
  try {
    const savedContext = localStorage.getItem('speed-reader-context');
    if (savedContext !== null) {
      state.showContext = savedContext === 'true';
    }
  } catch (e) {
    console.warn('Could not restore context preference:', e);
  }

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        if (state.isPlaying) {
          pause();
        } else {
          // If at end, restart from beginning
          if (state.currentIndex >= state.words.length) {
            state.currentIndex = 0;
          }
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
      case 'ArrowLeft':
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
          jumpBackParagraph();
        } else {
          jumpBackSentence();
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
          jumpForwardParagraph();
        } else {
          jumpForwardSentence();
        }
        break;
      case 'KeyP':
        e.preventDefault();
        cycleTimingMode();
        break;
      case 'KeyF':
        e.preventDefault();
        cycleFont();
        break;
      case 'KeyC':
        e.preventDefault();
        toggleContext();
        break;
      case 'KeyO':
        e.preventDefault();
        toggleFocusOverlay();
        break;
      case 'Escape':
        e.preventDefault();
        hideFocusOverlay();
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
    console.log('dragover - types:', e.dataTransfer.types, 'items:', e.dataTransfer.items?.length);
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
    console.log('dataTransfer.types:', e.dataTransfer.types);
    console.log('dataTransfer.files.length:', e.dataTransfer.files.length);
    console.log('dataTransfer.items:', e.dataTransfer.items);

    // Log all items in dataTransfer
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i];
        console.log(`Item ${i}:`, {
          kind: item.kind,
          type: item.type
        });

        // Try to get as file
        if (item.kind === 'file') {
          const file = item.getAsFile();
          console.log(`  File object:`, file);
        }
      }
    }

    // Check for dropped file first
    const file = e.dataTransfer.files[0];
    console.log('Dropped file (from files[0]):', file);
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

  // Save position when closing app
  window.addEventListener('beforeunload', () => {
    savePosition();
  });

  console.log('Event listeners attached');
});
