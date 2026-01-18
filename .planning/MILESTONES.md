# Project Milestones: Speed Reader

## v1.1 Polish (Shipped: 2026-01-18)

**Delivered:** Enhanced reading experience with intelligent word timing, 6 font options with persistence, and smooth visual transitions.

**Phases completed:** 5-7 (3 plans total)

**Key accomplishments:**

- Variable word timing with length/punctuation adjustments for natural reading rhythm
- 6 serif fonts (Times New Roman + 5 Google Fonts) with 'f' key cycling
- Smooth 50ms word transitions instead of hard cuts
- ORP baseline alignment fixed across all fonts
- Full preference persistence: WPM, font choice, font size

**Stats:**

- 15 files modified
- 1,272 lines of JavaScript/CSS/HTML (total)
- 3 phases, 3 plans, 6 tasks
- Built same day as v1.0 (2026-01-18)

**Git range:** `feat(05-01)` → `feat(07-01)`

**What's next:** Distribution packaging, or additional features as needed.

---

## v1.0 MVP (Shipped: 2026-01-18)

**Delivered:** Cross-platform RSVP speed reader with ORP highlighting, multi-format document support, full keyboard controls, and reading position persistence.

**Phases completed:** 1-4 (6 plans total)

**Key accomplishments:**

- Electron app with secure IPC architecture and lazy-loaded dependencies
- RSVP display with ORP (optimal recognition point) highlighting at 40% position
- Drag-drop file input supporting PDF, Word (.docx), and plain text
- Web URL text extraction using Readability algorithm
- Full keyboard controls: Space play/pause, arrows for speed, +/- for font size
- Sentence/paragraph navigation with quick-tap support (media player style)
- Position persistence per document via localStorage

**Stats:**

- 20 files created/modified
- ~2,750 lines of JavaScript/CSS/HTML
- 4 phases, 6 plans, ~18 tasks
- Built in single day (2026-01-18)

**Git range:** `feat(01-01)` → `docs(04-02)`

**What's next:** Polish, packaging for distribution, or new features as needed.

---
