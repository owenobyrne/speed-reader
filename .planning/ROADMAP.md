# Roadmap: Speed Reader

## Overview

Build a cross-platform RSVP reader from scratch: scaffold the Electron app, implement the core word-presentation engine with ORP highlighting, add file parsing for multiple formats, then polish with keyboard controls and persistence.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Electron app scaffold with basic window
- [x] **Phase 2: Core Reader** - RSVP display with ORP highlighting and visual design
- [ ] **Phase 3: File Handling** - Drag-drop input, text extraction from PDF/Word/URLs
- [ ] **Phase 4: Controls & Polish** - Keyboard controls, navigation, speed adjustment, position saving

## Phase Details

### Phase 1: Foundation
**Goal**: Working Electron app with basic window, project structure, and build pipeline
**Depends on**: Nothing (first phase)
**Research**: Unlikely (standard Electron setup)
**Plans**: TBD

Plans:
- [x] 01-01: Electron project setup and basic window

### Phase 2: Core Reader
**Goal**: RSVP word display with ORP highlighting, the core visual experience
**Depends on**: Phase 1
**Research**: Unlikely (internal UI, straightforward ORP calculation)
**Plans**: TBD

Plans:
- [x] 02-01: RSVP display engine with ORP highlighting and visual design (consolidated)

### Phase 3: File Handling
**Goal**: Accept files via drag-drop, extract text from PDF, Word docs, and web URLs
**Depends on**: Phase 2
**Research**: Likely (parsing libraries)
**Research topics**: pdf-parse or pdfjs-dist for PDFs, mammoth.js for Word docs, approach for web URL text extraction
**Plans**: TBD

Plans:
- [ ] 03-01: Drag-drop zone and file type detection
- [ ] 03-02: Text extraction from PDF and Word
- [ ] 03-03: Web URL text extraction

### Phase 4: Controls & Polish
**Goal**: Full keyboard control, speed adjustment, navigation, and position persistence
**Depends on**: Phase 3
**Research**: Unlikely (standard Electron patterns)
**Plans**: TBD

Plans:
- [ ] 04-01: Keyboard shortcuts (speed, pause/play, font size)
- [ ] 04-02: Navigation (jump sentence/paragraph) and position saving

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/1 | Complete | 2026-01-18 |
| 2. Core Reader | 1/1 | Complete | 2026-01-18 |
| 3. File Handling | 0/3 | Not started | - |
| 4. Controls & Polish | 0/2 | Not started | - |
