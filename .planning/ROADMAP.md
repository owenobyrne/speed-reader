# Roadmap: Speed Reader

## Overview

Build a cross-platform RSVP reader from scratch: scaffold the Electron app, implement the core word-presentation engine with ORP highlighting, add file parsing for multiple formats, then polish with keyboard controls and persistence.

## Milestones

- ✅ [v1.0 MVP](milestones/v1.0-ROADMAP.md) — Phases 1-4 (shipped 2026-01-18)
- ✅ **v1.1 Polish** — Phases 5-7 (complete)

## Completed Milestones

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-01-18</summary>

- [x] **Phase 1: Foundation** — Electron app scaffold with basic window
- [x] **Phase 2: Core Reader** — RSVP display with ORP highlighting and visual design
- [x] **Phase 3: File Handling** — Drag-drop input, text extraction from PDF/Word/URLs
- [x] **Phase 4: Controls & Polish** — Keyboard controls, navigation, speed adjustment, position saving

**Plans completed:** 6 total
**Details:** See [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

</details>

### ✅ v1.1 Polish (Complete)

**Milestone Goal:** Enhanced reading experience with intelligent timing, font options, and visual refinements.

#### Phase 5: Reading Timing ✓

**Goal**: Intelligent word timing based on punctuation and word length
**Depends on**: Phase 4 (v1.0 complete)
**Research**: Unlikely (internal patterns, timing calculations)
**Plans**: 1

Plans:
- [x] 05-01: Variable word timing with length/punctuation adjustments

#### Phase 6: Font System ✓

**Goal**: Google Fonts integration with "f" key cycling through font options
**Depends on**: Phase 5
**Research**: None needed (bundled locally)
**Plans**: 1

Fonts supported:
- Times New Roman (default, local)
- Tinos (Google Font)
- EB Garamond (Google Font)
- Merriweather (Google Font)
- Libre Baskerville (Google Font)
- Spectral (Google Font)

Plans:
- [x] 06-01: Bundle Google Fonts locally, implement font cycling with persistence

#### Phase 7: Visual Polish ✓

**Goal**: Smoother transitions and ORP baseline alignment fix
**Depends on**: Phase 6
**Research**: None needed
**Plans**: 1

Plans:
- [x] 07-01: Smooth word transitions, ORP baseline alignment fix

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 1/1 | Complete | 2026-01-18 |
| 2. Core Reader | v1.0 | 1/1 | Complete | 2026-01-18 |
| 3. File Handling | v1.0 | 2/2 | Complete | 2026-01-18 |
| 4. Controls & Polish | v1.0 | 2/2 | Complete | 2026-01-18 |
| 5. Reading Timing | v1.1 | 1/1 | Complete | 2026-01-18 |
| 6. Font System | v1.1 | 1/1 | Complete | 2026-01-18 |
| 7. Visual Polish | v1.1 | 1/1 | Complete | 2026-01-18 |
