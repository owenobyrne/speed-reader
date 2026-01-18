---
phase: 03-file-handling
plan: 02
subsystem: input
tags: [url-fetch, readability, jsdom, ipc-architecture, electron-gpu]

# Dependency graph
requires:
  - phase: 03-file-handling/03-01
    provides: Preload infrastructure, drag-drop zone, PDF/Word parsing
provides:
  - URL paste/drop with article extraction
  - IPC-based architecture (parsing in main process)
  - GPU compatibility flags for Windows
  - Lazy-loaded dependencies for fast startup
  - webUtils.getPathForFile for secure file path access
affects: [04-controls-polish]

# Tech tracking
tech-stack:
  added: [@mozilla/readability@0.6.0, jsdom@27.4.0]
  modified: [pdf-parse@1.1.1 (downgraded from 2.x)]
  patterns: [electron-ipc-main-process, lazy-loading, webUtils-file-path]

key-files:
  created: []
  modified: [main.js, preload.js, renderer.js, package.json, styles.css]

key-decisions:
  - "Move heavy parsing to main process via IPC (jsdom requires Node APIs)"
  - "Downgrade pdf-parse to v1.1.1 (v2.x has breaking API changes)"
  - "Use webUtils.getPathForFile() for file paths with contextIsolation"
  - "Lazy-load heavy dependencies for fast app startup"
  - "GPU compatibility flags for Windows (disableHardwareAcceleration, no-sandbox)"

patterns-established:
  - "IPC pattern: ipcMain.handle in main.js, ipcRenderer.invoke via preload"
  - "Lazy loading: require() inside handler, not at module top"
  - "File path security: webUtils.getPathForFile(file) not file.path"

issues-created:
  - "ORP baseline alignment with surrounding word parts (visual polish)"

# Metrics
duration: ~30min (significant debugging)
completed: 2026-01-18
---

# Phase 3 Plan 02: Web URL Text Extraction Summary

**URL paste/drop support using Mozilla Readability, with major architecture refactoring for Electron compatibility**

## Performance

- **Duration:** ~30 min (extended due to Electron compatibility issues)
- **Started:** 2026-01-18
- **Completed:** 2026-01-18
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 5

## Accomplishments

- Installed @mozilla/readability and jsdom for article extraction
- URL paste handler (Ctrl+V) extracts and loads article text
- URL drop handler for dragging URLs from browser
- Loading state feedback during URL fetch
- Refactored to IPC architecture (main process handles heavy parsing)
- Added GPU compatibility flags for Windows
- Lazy-loaded dependencies for fast startup (~instant vs ~10s)
- Fixed file drop using webUtils.getPathForFile()
- Improved ORP positioning (locked to center tick, 40% into word)

## Architecture Changes

**Major refactor: Preload → Main Process IPC**

Original approach put parsing in preload.js, but:
- jsdom requires Node's `vm` module (unavailable in renderer)
- sandbox restrictions blocked Node modules in preload

Solution: All parsing moved to main.js with IPC handlers:
```javascript
// main.js
ipcMain.handle('fetch-url', async (event, url) => { ... });
ipcMain.handle('parse-pdf', async (event, filePath) => { ... });

// preload.js (thin wrapper)
fetchURL: (url) => ipcRenderer.invoke('fetch-url', url)
```

## Task Commits

1. **Task 1: Install Readability and URL parser** - Readability/jsdom installed, IPC handlers created
2. **Task 2: Integrate URL handling** - Paste/drop handlers, loading feedback
3. **Task 3: Human-verify checkpoint** - All input methods verified working

## Files Modified

- `main.js` - Added IPC handlers, GPU flags, lazy-loaded dependencies
- `preload.js` - Thin IPC wrapper, webUtils.getPathForFile exposure
- `renderer.js` - URL handlers, ORP improvements, file path fix
- `package.json` - Added readability, jsdom; downgraded pdf-parse
- `styles.css` - ORP center-lock positioning

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| IPC architecture | jsdom/vm module incompatible with renderer process |
| pdf-parse v1.1.1 | v2.x has class-based API, v1.x is simpler function |
| Lazy loading | Heavy deps (jsdom) caused 10+ second startup |
| GPU flags | Windows compatibility (GPU process errors) |
| webUtils.getPathForFile | file.path unavailable with contextIsolation |

## Deviations from Plan

- **Significant:** Entire architecture changed from preload-based to IPC-based
- **Added:** GPU compatibility flags (not in original scope)
- **Added:** Lazy loading optimization (not in original scope)
- **Changed:** pdf-parse downgraded due to API breaking changes

## Issues Encountered

1. **jsdom in renderer** - `vm module unsupported` error → Moved to main process
2. **GPU process errors on Windows** - Added disableHardwareAcceleration + flags
3. **pdf-parse v2 API** - Breaking changes → Downgraded to v1.1.1
4. **file.path undefined** - contextIsolation blocks it → Use webUtils.getPathForFile
5. **Slow startup** - Heavy deps at top → Lazy loading

## Known Issues (Deferred)

- ORP character baseline alignment with surrounding word parts (minor visual polish)

## Phase 3 Complete

All file handling capabilities implemented:
- ✓ PDF drag-drop
- ✓ Word (.docx) drag-drop
- ✓ Text file drag-drop
- ✓ URL paste (Ctrl+V)
- ✓ URL drag-drop

Ready for Phase 4: Controls & Polish

---
*Phase: 03-file-handling*
*Completed: 2026-01-18*
