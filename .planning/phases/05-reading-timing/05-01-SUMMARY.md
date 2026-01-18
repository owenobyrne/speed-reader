---
phase: 05-reading-timing
plan: 01
subsystem: ui
tags: [rsvp, timing, ux, reading]

# Dependency graph
requires:
  - phase: 02-core-reader
    provides: RSVP display with fixed-interval playback
  - phase: 04-controls-polish
    provides: Keyboard speed controls, state management
provides:
  - Variable word timing based on length and punctuation
  - setTimeout chaining for per-word delay calculation
  - More natural reading rhythm at sentence boundaries
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [setTimeout-chaining, variable-word-timing]

key-files:
  created: []
  modified: [renderer.js]

key-decisions:
  - "15% extra time per character above 6 chars for length adjustment"
  - "50% bonus delay for sentence-ending punctuation (.!?)"
  - "25% bonus delay for pause punctuation (,;:)"
  - "Cap maximum delay at 3x base to prevent extreme pauses"

patterns-established:
  - "Per-word timing via setTimeout chaining instead of fixed setInterval"

issues-created: []

# Metrics
duration: 2 min
completed: 2026-01-18
---

# Phase 5 Plan 1: Reading Timing Summary

**Variable word timing with 15% length bonus and punctuation pauses via setTimeout chaining**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-18T22:06:13Z
- **Completed:** 2026-01-18T22:07:56Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Implemented calculateWordDelay() for intelligent per-word timing
- Replaced setInterval with setTimeout chaining for dynamic delays
- Longer words now display proportionally longer (15% per char above 6)
- Punctuation adds natural pauses (50% for .!?, 25% for ,;:)

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement word timing calculator** - `7c42f2c` (feat)
2. **Task 2: Replace fixed interval with dynamic scheduling** - `77b143c` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified

- `renderer.js` - Added calculateWordDelay(), modified advanceWord/play/pause/setSpeed for setTimeout chaining

## Decisions Made

- Used multiplicative formula: baseDelay * lengthMultiplier + baseDelay * punctuationBonus
- Capped at 3x base delay to prevent jarring long pauses on very long words with punctuation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- Reading timing complete, feels more natural
- Ready for Phase 6: Font System

---
*Phase: 05-reading-timing*
*Completed: 2026-01-18*
