# Roadmap: Speed Reader

## Overview

Build a cross-platform RSVP reader from scratch: scaffold the Electron app, implement the core word-presentation engine with ORP highlighting, add file parsing for multiple formats, then polish with keyboard controls and persistence.

## Milestones

- ✅ [v1.0 MVP](milestones/v1.0-ROADMAP.md) — Phases 1-4 (shipped 2026-01-18)
- ✅ [v1.1 Polish](milestones/v1.1-ROADMAP.md) — Phases 5-7 (shipped 2026-01-18)
- ✅ [v1.2 UI Refinements](milestones/v1.2-ROADMAP.md) — Phases 8-9 (shipped 2026-01-18)
- 🚧 **v1.3 Windows Distribution** — Phases 10-12 (in progress)

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

## 🚧 v1.3 Windows Distribution (In Progress)

**Milestone Goal:** Package Speed Reader as a distributable Windows application with installer, icons, and proper metadata.

### Phase 10: Build Configuration ✅

**Goal**: Set up electron-builder for Windows packaging with app metadata
**Depends on**: Phase 9
**Research**: Likely (electron-builder configuration, build targets)
**Research topics**: electron-builder Windows config, NSIS options, build scripts
**Plans**: 1/1 complete

Plans:
- [x] 10-01: Build Configuration Setup (complete 2026-01-19)

### Phase 11: Windows Installer ✅

**Goal**: Create NSIS installer with app icon, start menu shortcuts, and uninstaller
**Depends on**: Phase 10
**Research**: Unlikely (standard NSIS patterns)
**Plans**: 1/1 complete

Plans:
- [x] 11-01: NSIS Installer Configuration (complete 2026-01-19)

### Phase 12: Distribution Package

**Goal**: Generate final distributable package with proper versioning and metadata
**Depends on**: Phase 11
**Research**: Unlikely (electron-builder build command)
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
| 10. Build Configuration | v1.3 | 1/1 | Complete | 2026-01-19 |
| 11. Windows Installer | v1.3 | 1/1 | Complete | 2026-01-19 |
| 12. Distribution Package | v1.3 | 0/? | Not started | - |
