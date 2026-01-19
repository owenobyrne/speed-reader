# Roadmap: Speed Reader

## Overview

Build a cross-platform RSVP reader from scratch: scaffold the Electron app, implement the core word-presentation engine with ORP highlighting, add file parsing for multiple formats, then polish with keyboard controls and persistence.

## Milestones

- ✅ [v1.0 MVP](milestones/v1.0-ROADMAP.md) — Phases 1-4 (shipped 2026-01-18)
- ✅ [v1.1 Polish](milestones/v1.1-ROADMAP.md) — Phases 5-7 (shipped 2026-01-18)
- ✅ [v1.2 UI Refinements](milestones/v1.2-ROADMAP.md) — Phases 8-9 (shipped 2026-01-18)
- 🚧 **v1.3 Window Management** — Phases 10-12 (in progress)

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

<details>
<summary>✅ v1.2 UI Refinements (Phases 8-9) — SHIPPED 2026-01-18</summary>

**Milestone Goal:** Frameless window with custom controls and focus overlay for distraction-free reading.

- [x] **Phase 8: Frameless Window** — Custom title bar with minimize/close controls
- [x] **Phase 9: Focus Overlay** — Fullscreen dark backdrop with 'o' key toggle

**Plans completed:** 2 total

</details>

## 🚧 v1.3 Window Management (In Progress)

**Milestone Goal:** Enhanced window management with position persistence, multi-monitor support, and user preferences for window behavior.

### Phase 10: Window Positioning

**Goal**: Save and restore window position and size across sessions
**Depends on**: Phase 9
**Research**: Unlikely (Electron BrowserWindow APIs)
**Plans**: TBD

Plans:
- [ ] 10-01: TBD (run /gsd:plan-phase 10 to break down)

### Phase 11: Multi-Monitor Support

**Goal**: Detect and handle multi-monitor setups with proper window placement
**Depends on**: Phase 10
**Research**: Unlikely (Electron screen API)
**Plans**: TBD

Plans:
- [ ] 11-01: TBD

### Phase 12: Window Preferences

**Goal**: Add preferences UI for customizing window behavior settings
**Depends on**: Phase 11
**Research**: Unlikely (internal UI patterns)
**Plans**: TBD

Plans:
- [ ] 12-01: TBD

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
| 8. Frameless Window | v1.2 | 1/1 | Complete | 2026-01-18 |
| 9. Focus Overlay | v1.2 | 1/1 | Complete | 2026-01-18 |
| 10. Window Positioning | v1.3 | 0/? | Not started | - |
| 11. Multi-Monitor Support | v1.3 | 0/? | Not started | - |
| 12. Window Preferences | v1.3 | 0/? | Not started | - |
