# Speed Reader

## What This Is

A cross-platform desktop application for rapid serial visual presentation (RSVP) reading. Users drag and drop documents (Word, PDF) or web links, and the app presents text one word at a time at adjustable speeds. Built with Electron for Mac, Windows, and Linux.

## Core Value

The reading experience must be smooth, comfortable, and visually refined — word presentation timing, the ORP (optimal recognition point) highlighting, and overall visual design are paramount.

## Requirements

### Validated

- Drag-and-drop file input (PDF, Word docs, web links) — v1.0
- Text extraction/parsing from supported formats — v1.0
- Single-word RSVP display with ORP highlighting — v1.0
- Visual design: black background, guide lines with tick marks, white Times New Roman, red ORP — v1.0
- Speed control (100-1000 WPM) via keyboard shortcuts — v1.0
- Pause/play functionality — v1.0
- Navigation: jump back sentence, jump back paragraph — v1.0
- Adjustable word/font size — v1.0
- Save and resume reading position per document — v1.0
- Full keyboard control for all features — v1.0
- Variable word timing (length/punctuation adjustments) — v1.1
- Multiple font options with keyboard cycling — v1.1
- Smooth word transitions — v1.1
- Preference persistence (WPM, font, font size) — v1.1

### Active

(None — all v1.1 requirements validated)

### Out of Scope

- Cloud sync / user accounts — local-only for v1, keeps it simple and offline-capable
- Text-to-speech — visual reading experience only
- Mobile version — desktop focus for v1

## Context

**Current State (v1.1 shipped):**
- ~1,272 lines of JavaScript/CSS/HTML (core app files)
- Tech stack: Electron 40, pdf-parse, mammoth.js, Readability
- 7 phases, 9 plans completed in single day
- 6 bundled serif fonts (~142KB)

RSVP reading works by presenting words sequentially at a fixed point, eliminating eye movement. The "optimal recognition point" (ORP) is typically slightly left of center — highlighting this letter in red helps the brain process words faster. The tick marks on the guide lines help anchor visual focus.

Key UX considerations:
- Longer words may need slightly more display time
- Punctuation (periods, commas) may benefit from brief pauses
- The transition between words should feel smooth, not jarring

## Constraints

- **Offline**: Must work without internet connection for core reading functionality
- **Cross-platform**: Electron targeting Mac, Windows, Linux
- **Performance**: Word presentation timing must be precise — no jank or drift at high speeds

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Electron over Tauri | User preference, familiar ecosystem | Good |
| Times New Roman font | Classic readability, user specified | Good |
| 100-1000 WPM range | Covers casual to speed-reading use cases | Good |
| ORP at 40% position | Research-based optimal recognition | Good |
| IPC architecture for parsing | Security with contextIsolation | Good |
| Lazy-load heavy dependencies | Fast startup (~instant vs 10s) | Good |
| Quick-tap navigation (500ms) | Media player style UX | Good |
| setTimeout chaining for timing | Enables per-word variable delay | Good |
| Bundle fonts locally (woff2) | Offline support, no CDN dependency | Good |
| 50ms word transitions | Smooth without interfering with high WPM | Good |
| Wrapper-based ORP layout | Natural baseline alignment across fonts | Good |

---
*Last updated: 2026-01-18 after v1.1 milestone*
