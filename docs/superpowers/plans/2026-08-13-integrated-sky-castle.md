# Integrated Sky and Castle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the CSS-to-image sky seam with continuous artwork and integrate the castle directly into the hilltop background.

**Architecture:** Provide empty and completed extended-world raster variants for wide and narrow modes. Phaser renders the empty world as a base and fades a completed-world layer according to castle unlock state; CSS positions the profile within the new cloud layer and increases supporting-copy contrast.

**Tech Stack:** Vite, TypeScript, Phaser 4, Vitest, CSS, generated PNG/WebP artwork

## Global Constraints

- Keep the page scroll-free and preserve the background artwork aspect ratio.
- Preserve the existing 16-bit quarter-top-down visual direction and current map layout.
- Keep the profile borderless and visually floating.
- Do not change game progression or persistence.

---

### Task 1: Extended world artwork

**Files:**
- Create: `assets/game-source/kingdom/world-empty-extended.png`
- Create: `assets/game-source/kingdom/world-castle-extended.png`
- Create: `assets/game-source/kingdom/world-mobile-empty-extended.png`
- Create: `assets/game-source/kingdom/world-mobile-castle-extended.png`
- Create: matching WebP files under `public/assets/game/kingdom/`

- [x] Generate an extended-sky empty world that preserves the existing map exactly.
- [x] Generate its castle-complete counterpart with only the hilltop changed.
- [x] Produce matching narrow variants without cropping interactive sites.
- [x] Inspect all four source images for map alignment and consistent pixel scale.

### Task 2: Castle background state

**Files:**
- Modify: `src/game/KingdomScene.ts`
- Create: `src/game/worldVisuals.ts`
- Test: `src/game/worldVisuals.test.ts`

- [x] Write a failing test that maps wide/narrow mode to empty and completed texture keys.
- [x] Run the focused test and confirm the missing interface failure.
- [x] Add `getWorldTextureKeys(mode)` and preload all four background textures.
- [x] Replace the castle sprite with a completed background layer that fades according to `unlocked.castle`.
- [x] Run the focused test and full scene-related tests.

### Task 3: Floating profile treatment

**Files:**
- Modify: `src/styles.css`

- [x] Move the profile downward into the illustrated cloud layer using clamped viewport positioning.
- [x] Increase subtitle/link opacity and weight and strengthen the compact dark-blue shadow.
- [x] Preserve pointer behavior, reduced motion, and borderless presentation.

### Task 4: Visual and build verification

**Files:**
- Modify: `public/assets/game/kingdom/README.md`

- [x] Document the empty/completed background pairs and source files.
- [x] Inspect the completed wide state in the live browser and both source pairs at native dimensions.
- [ ] Run `npm test -- --run`.
- [ ] Run `npm run build`.
- [ ] Run `git diff --check`.
