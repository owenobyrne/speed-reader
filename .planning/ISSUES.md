# Project Issues Log

Enhancements discovered during execution. Not critical - address in future phases.

## Open Enhancements

### ISS-001: Focus overlay visual improvements

- **Discovered:** Phase 11 post-execution (2026-01-19)
- **Type:** UX / Performance
- **Description:** Focus overlay has minor visual issues that could be improved:
  1. **Flash on toggle**: Brief flash/flicker when toggling overlay on/off
  2. **Taskbar visibility**: System taskbar appears on top of the backdrop (expected on Linux/WSL, may behave differently on Windows)

- **Context - What was tried:**

  **Approach 1: Opacity-based toggle (failed)**
  - Used `setOpacity(0)` for hidden, `setOpacity(0.85)` for visible
  - Issue: Invisible window still blocked clicks (alwaysOnTop remained active)
  - Commit: Not kept

  **Approach 2: hide()/show() without z-order management (failed)**
  - Used `hide()` and `show()` instead of opacity
  - Issue: Backdrop covered main window when shown (both alwaysOnTop:true)
  - Commit: Not kept

  **Approach 3: Z-order levels (partial success)**
  - Backdrop at `alwaysOnTop(true, 'normal')` level
  - Main window at `alwaysOnTop(true, 'floating')` level
  - Issue: Z-order levels didn't work reliably, main still covered
  - Commit: Part of final solution

  **Approach 4: Z-order + moveTop() (current working solution)**
  - Combined z-order levels with explicit `moveTop()` call
  - Main window uses: `setAlwaysOnTop(true, 'floating')` + `showInactive()` + `focus()` + `moveTop()`
  - Result: WORKS - main window stays on top, backdrop behind
  - Minor issues: Flash on toggle, taskbar on top (may be platform-specific)
  - Commits: cc9cbbd, 1f6665f, 43119a8, 2d0e2ed

- **Possible improvements:**
  1. Investigate smooth fade transitions instead of instant show/hide
  2. Platform-specific handling for taskbar (may work correctly on native Windows)
  3. Alternative: Use lower z-order for backdrop (not alwaysOnTop) and rely on fullscreen coverage
  4. Investigate if `type: 'desktop'` behaves differently across platforms

- **Impact:** Low (works correctly, these are minor polish issues)
- **Effort:** Medium (requires platform testing and possibly different approaches per OS)
- **Suggested phase:** Future enhancement / v1.4 Polish

## Closed Enhancements

[None yet]

---

## Notes

- Focus overlay feature works as intended on WSL/Linux
- Flash and taskbar issues may be platform-specific
- Windows native behavior should be tested before further changes
- Current implementation: main.js lines 25-199 (backdrop creation and toggle handlers)
