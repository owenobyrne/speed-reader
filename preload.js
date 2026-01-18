const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

/**
 * Check if a string is a valid HTTP/HTTPS URL.
 * @param {string} str - String to check
 * @returns {boolean} - True if valid URL
 */
function isURL(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Fetch a URL and extract article text using Readability.
 * @param {string} url - URL to fetch
 * @returns {Promise<string>} - Extracted article text
 */
async function fetchURL(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article || !article.textContent) {
    throw new Error('Could not extract article content from this URL');
  }

  return article.textContent;
}

contextBridge.exposeInMainWorld('fileAPI', {
  readFile: (filePath) => fs.readFileSync(filePath),
  getExtension: (filePath) => path.extname(filePath).toLowerCase(),
  isURL: isURL,
  fetchURL: fetchURL
});
