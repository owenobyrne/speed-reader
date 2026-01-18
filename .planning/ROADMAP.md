# Roadmap: Speed Reader

## Overview

Build a cross-platform RSVP reader from scratch: scaffold the Electron app, implement the core word-presentation engine with ORP highlighting, add file parsing for multiple formats, then polish with keyboard controls and persistence.

## Milestones

- ✅ [v1.0 MVP](milestones/v1.0-ROADMAP.md) — Phases 1-4 (shipped 2026-01-18)
- ✅ [v1.1 Polish](milestones/v1.1-ROADMAP.md) — Phases 5-7 (shipped 2026-01-18)
- 🚧 **v1.2 UI Refinements** — Phase 8 (in progress)

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

<details>
<summary>✅ v1.1 Polish (Phases 5-7) — SHIPPED 2026-01-18</summary>

- [x] **Phase 5: Reading Timing** — Variable word timing with length/punctuation adjustments
- [x] **Phase 6: Font System** — 6 serif fonts with 'f' key cycling and persistence
- [x] **Phase 7: Visual Polish** — Smooth transitions and ORP baseline alignment

**Plans completed:** 3 total
**Details:** See [milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md)

</details>

### 🚧 v1.2 UI Refinements (In Progress)

**Milestone Goal:** Frameless window with custom title bar controls for cleaner visual appearance.

#### Phase 8: Frameless Window

**Goal**: Remove window chrome, add custom close/minimize icons in top right
**Depends on**: Phase 7 (v1.1 complete)
**Research**: Unlikely (Electron frameless window is well-documented)
**Plans**: TBD

Plans:
- [ ] 08-01: TBD (run /gsd:plan-phase 8 to break down)

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
| 8. Frameless Window | v1.2 | 0/? | Not started | - |
