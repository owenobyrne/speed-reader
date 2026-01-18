// RSVP Display Engine

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

// Test with a single word on load
document.addEventListener('DOMContentLoaded', () => {
  displayWord('reading');
});
