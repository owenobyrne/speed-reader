# Phase 3: File Handling - Research

**Researched:** 2026-01-18
**Domain:** Document parsing and text extraction in Electron
**Confidence:** HIGH

<research_summary>
## Summary

Researched the Node.js/Electron ecosystem for extracting text from PDFs, Word documents, and web URLs. The standard approach uses specialized libraries for each format: pdf-parse for PDFs (simple wrapper around pdfjs-dist), mammoth.js for Word docs, and Mozilla's Readability.js for web content extraction.

Key finding: All three libraries are well-maintained, battle-tested solutions. Don't hand-roll parsers - PDF and Word formats are complex, and article extraction algorithms have decades of refinement behind them.

**Primary recommendation:** Use pdf-parse + mammoth + @mozilla/readability stack. Handle file access through Electron's preload/IPC pattern due to contextIsolation security requirements.

**Note on body text extraction:**
- **Web URLs:** Readability.js automatically extracts only main article content (excludes nav, headers, footers, sidebars, ads). This is its core purpose.
- **PDFs/Word:** Extract all text including headers/footers. For v1, accept this; can add post-processing filter later (detect lines repeating on every page = likely header/footer).
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pdf-parse | ^1.1.1 | PDF text extraction | Simple API, wraps pdfjs-dist, handles common cases |
| mammoth | ^1.6.0 | Word .docx text extraction | Standard for docx→HTML/text, browser+Node.js |
| @mozilla/readability | ^0.5.0 | Web article text extraction | Powers Firefox Reader Mode, battle-tested |
| jsdom | ^24.0.0 | DOM for Node.js | Required by Readability in Node environment |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dompurify | ^3.0.0 | HTML sanitization | When displaying extracted HTML content |
| node-fetch | ^3.3.0 | HTTP requests | Fetching web pages for URL extraction |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| pdf-parse | pdfjs-dist directly | More control but more complex API |
| mammoth | docx4js | mammoth is simpler, docx4js gives more structure |
| Readability | cheerio + custom | Readability handles edge cases better |

**Installation:**
```bash
npm install pdf-parse mammoth @mozilla/readability jsdom
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
src/
├── parsers/
│   ├── pdf-parser.js      # PDF text extraction
│   ├── docx-parser.js     # Word document extraction
│   ├── url-parser.js      # Web URL text extraction
│   └── index.js           # Parser factory/router
├── preload.js             # Electron preload script
└── renderer.js            # Existing RSVP renderer
```

### Pattern 1: Electron File Handling with contextIsolation
**What:** Use preload script to expose file reading APIs safely
**When to use:** Any file I/O in Electron with contextIsolation: true

**preload.js:**
```javascript
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('fileAPI', {
  readFile: (filePath) => fs.readFileSync(filePath),
  getExtension: (filePath) => path.extname(filePath).toLowerCase()
});
```

**main.js (update BrowserWindow):**
```javascript
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js')
  }
});
```

### Pattern 2: Parser Factory
**What:** Route files to appropriate parser based on extension/type
**When to use:** Multiple input formats

```javascript
async function extractText(filePath, fileBuffer) {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case '.pdf':
      return await parsePDF(fileBuffer);
    case '.docx':
      return await parseDocx(fileBuffer);
    case '.txt':
      return fileBuffer.toString('utf-8');
    default:
      throw new Error(`Unsupported format: ${ext}`);
  }
}
```

### Pattern 3: URL Detection and Fetching
**What:** Detect URLs in drag-drop and fetch content
**When to use:** Supporting web URL input

```javascript
function isURL(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

async function extractFromURL(url) {
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();
  return article?.textContent || '';
}
```

### Anti-Patterns to Avoid
- **Reading files directly in renderer:** Use preload + IPC for security
- **Parsing PDF manually:** PDF format is complex, use libraries
- **Custom article extraction:** Readability handles edge cases you won't anticipate
- **Ignoring file validation:** Check extensions and magic bytes
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF text extraction | Custom PDF parser | pdf-parse | PDF spec is 756 pages, edge cases everywhere |
| Word doc parsing | Manual XML extraction | mammoth | .docx is zipped XML with complex relationships |
| Article extraction | Regex/cheerio scraping | Readability | 10+ years of edge case handling, ML-informed |
| HTML sanitization | String replacement | DOMPurify | XSS attacks are subtle and varied |
| File type detection | Extension only | Check magic bytes too | Extensions can be spoofed |

**Key insight:** Document formats are deceptively complex. A "simple" PDF might have multiple text encodings, embedded fonts, rotated pages, and content streams in arbitrary order. Libraries exist because these problems are hard.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Large File Memory Issues
**What goes wrong:** App freezes or crashes on large PDFs
**Why it happens:** Loading entire file into memory, synchronous processing
**How to avoid:** Use streaming where possible, show loading indicator, consider file size limits for RSVP use case
**Warning signs:** Slow response on files >5MB

### Pitfall 2: Encoding Issues
**What goes wrong:** Garbled text, missing characters
**Why it happens:** Wrong encoding assumption, non-UTF8 documents
**How to avoid:** mammoth and pdf-parse handle encoding; for raw text, detect encoding first
**Warning signs:** "�" characters, wrong accents

### Pitfall 3: Scanned PDFs (No Text Layer)
**What goes wrong:** Empty extraction from PDF
**Why it happens:** PDF is images only, no extractable text
**How to avoid:** Detect empty extraction, inform user "This PDF appears to be scanned images"
**Warning signs:** PDF has pages but extraction returns empty/whitespace only

### Pitfall 4: URL Extraction Failures
**What goes wrong:** Empty or garbage text from URLs
**Why it happens:** JavaScript-rendered content, paywalls, bot detection
**How to avoid:** Readability handles most cases; accept that some sites won't work
**Warning signs:** Very short extraction, HTML tags in output

### Pitfall 5: contextIsolation Security
**What goes wrong:** Security vulnerability or broken file access
**Why it happens:** Exposing too much through preload, or not using preload at all
**How to avoid:** Use contextBridge, expose minimal API, validate file paths
**Warning signs:** Direct `require()` in renderer, nodeIntegration: true
</common_pitfalls>

<code_examples>
## Code Examples

### PDF Text Extraction
```javascript
// Source: pdf-parse npm documentation
const pdfParse = require('pdf-parse');

async function parsePDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text; // Plain text content
  // data.numpages, data.info also available
}
```

### Word Document Text Extraction
```javascript
// Source: mammoth.js GitHub README
const mammoth = require('mammoth');

async function parseDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value; // Plain text, paragraphs separated by \n\n
}
```

### Web URL Text Extraction
```javascript
// Source: Mozilla Readability GitHub
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');

async function parseURL(url) {
  const response = await fetch(url);
  const html = await response.text();

  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article) {
    throw new Error('Could not extract article content');
  }

  return article.textContent;
}
```

### Drag-Drop Handler (Renderer)
```javascript
// Handle drag-drop in renderer with contextIsolation
const dropZone = document.getElementById('drop-zone');

dropZone.addEventListener('drop', async (e) => {
  e.preventDefault();

  const file = e.dataTransfer.files[0];
  if (!file) return;

  // File path available in Electron
  const filePath = file.path;
  const buffer = window.fileAPI.readFile(filePath);
  const ext = window.fileAPI.getExtension(filePath);

  // Route to appropriate parser
  let text;
  if (ext === '.pdf') {
    text = await parsePDF(buffer);
  } else if (ext === '.docx') {
    text = await parseDocx(buffer);
  }

  loadText(text); // Load into RSVP engine
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
});
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| pdf.js direct use | pdf-parse wrapper | Ongoing | Simpler API for text extraction |
| docx → HTML → text | mammoth.extractRawText | Available since 2020 | Direct text extraction without HTML step |
| Custom scraping | Readability.js | Standard since Firefox Reader | Much better article detection |

**New tools/patterns to consider:**
- **pdf-parse TypeScript version:** Pure TS, cross-platform (including browser)
- **Readability for RAG:** Increasingly used for AI/LLM text preparation

**Deprecated/outdated:**
- **textract:** Older library, less maintained than pdf-parse
- **Custom regex scraping:** Readability is now the standard
</sota_updates>

<open_questions>
## Open Questions

1. **Scanned PDF handling**
   - What we know: pdf-parse returns empty for image-only PDFs
   - What's unclear: Best UX for informing user
   - Recommendation: Detect empty result, show helpful message, don't fail silently

2. **URL CORS/fetch restrictions**
   - What we know: Some sites block automated requests
   - What's unclear: How many real-world URLs will fail
   - Recommendation: Implement in main process where CORS doesn't apply, handle failures gracefully
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [pdf-parse npm](https://www.npmjs.com/package/pdf-parse) - API documentation
- [mammoth.js GitHub](https://github.com/mwilliamson/mammoth.js) - README and API
- [Mozilla Readability GitHub](https://github.com/mozilla/readability) - Official source
- [Electron Context Isolation Docs](https://www.electronjs.org/docs/latest/tutorial/context-isolation) - Official tutorial
- [Electron Native File Drag & Drop](https://www.electronjs.org/docs/latest/tutorial/native-file-drag-drop) - Official tutorial

### Secondary (MEDIUM confidence)
- [npm-compare PDF libraries](https://npm-compare.com/pdf-lib,pdf-parse,pdfjs-dist) - Download trends, feature comparison
- [Strapi PDF Parsing Libraries Guide](https://strapi.io/blog/7-best-javascript-pdf-parsing-libraries-nodejs-2025) - 2025 comparison
- [Readability for RAG blog post](https://philna.sh/blog/2025/01/09/html-content-retrieval-augmented-generation-readability-js/) - 2025 use case

### Tertiary (LOW confidence - needs validation)
- None - all findings verified against official sources
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Electron file handling, Node.js document parsing
- Ecosystem: pdf-parse, mammoth, Readability, jsdom
- Patterns: Parser factory, preload/IPC, drag-drop handling
- Pitfalls: Memory, encoding, scanned PDFs, URL failures, security

**Confidence breakdown:**
- Standard stack: HIGH - npm download trends, official documentation
- Architecture: HIGH - Electron official patterns
- Pitfalls: HIGH - documented in library READMEs
- Code examples: HIGH - from official sources

**Research date:** 2026-01-18
**Valid until:** 2026-02-18 (30 days - stable ecosystem)
</metadata>

---

*Phase: 03-file-handling*
*Research completed: 2026-01-18*
*Ready for planning: yes*
