# Speed Reader

## What This Is

A cross-platform desktop application for rapid serial visual presentation (RSVP) reading. Users drag and drop documents (Word, PDF) or web links, and the app presents text one word at a time at adjustable speeds. Built with Electron for Mac, Windows, and Linux.

## Core Value

The reading experience must be smooth, comfortable, and visually refined — word presentation timing, the ORP (optimal recognition point) highlighting, and overall visual design are paramount.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Drag-and-drop file input (PDF, Word docs, web links)
- [ ] Text extraction/parsing from supported formats
- [ ] Single-word RSVP display with ORP highlighting
- [ ] Visual design: black background, two dim white horizontal lines with tick marks, white Times New Roman text, red letter at ORP position
- [ ] Speed control (100-1000 WPM) via keyboard shortcuts
- [ ] Pause/play functionality
- [ ] Navigation: jump back sentence, jump back paragraph
- [ ] Adjustable word/font size
- [ ] Save and resume reading position per document
- [ ] Full keyboard control for all features

### Out of Scope

- Cloud sync / user accounts — local-only for v1, keeps it simple and offline-capable
- Text-to-speech — visual reading experience only
- Mobile version — desktop focus for v1

## Context

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
| Electron over Tauri | User preference, familiar ecosystem | — Pending |
| Times New Roman font | Classic readability, user specified | — Pending |
| 100-1000 WPM range | Covers casual to speed-reading use cases | — Pending |

---
*Last updated: 2026-01-18 after initialization*
