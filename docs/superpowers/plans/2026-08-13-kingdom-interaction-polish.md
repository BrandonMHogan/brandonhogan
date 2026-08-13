# Kingdom Interaction Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every kingdom progression transition readable and consistent while keeping controls, hit areas, and effects anchored to the correct artwork across desktop, resizing, and mobile mode.

**Architecture:** Put layout mode, control anchors, and normalized hit footprints in `worldLayout.ts` so DOM and Phaser consume the same projection. Add a small transition contract module for deterministic timing, let `KingdomScene` own background crossfades and resize-driven world rebuilds, and let `main.ts` delay newly unlocked DOM controls using the same timing contract.

**Tech Stack:** TypeScript, Phaser 3, DOM/CSS, Vitest, Vite.

## Global Constraints

- Do not modify or regenerate any approved 3840x1917 progression artwork.
- Use a 900ms crossfade for every progression background change.
- Reveal newly unlocked controls during the final 350ms of that transition.
- Use explicit normalized hit footprints for Farm, Lumber Camp, Town, Quarry, and Castle.
- Float site UI by no more than 3px on an approximately three-second cycle.
- Resource popups remain readable for about 1.4 seconds and fade only near the end.
- Widths below 680 CSS pixels use narrow mode everywhere.
- Reduced motion disables crossfades, floating motion, and popup travel.

---

### Task 1: Shared responsive layout contracts

**Files:**
- Modify: `src/game/worldLayout.ts`
- Modify: `src/game/worldLayout.test.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Produces: `getWorldMode(width: number): WorldMode`
- Produces: `WorldLayout.hitAreas: Record<SiteName, { center: Point; width: number; height: number }>`
- Produces: updated `WorldLayout.controls` anchors.

- [ ] **Step 1: Write failing tests** asserting 679 selects narrow, 680 selects wide, Farm controls share the Farm x coordinate, Lumber controls share the Lumber site x coordinate and sit below its current tree-line position, and every hit footprint stays within normalized artwork bounds.
- [ ] **Step 2: Run `npm test -- --run src/game/worldLayout.test.ts`** and confirm the new assertions fail for the missing shared mode function, old anchors, and missing hit areas.
- [ ] **Step 3: Implement the shared mode function, approved control anchors, and normalized site footprints** in `worldLayout.ts`; replace `main.ts`'s media-query decision with `getWorldMode(gameElement.clientWidth)` and project against the game element dimensions.
- [ ] **Step 4: Run `npm test -- --run src/game/worldLayout.test.ts`** and confirm it passes.

### Task 2: Deterministic transition and feedback timing

**Files:**
- Create: `src/game/interactionMotion.ts`
- Create: `src/game/interactionMotion.test.ts`
- Modify: `src/game/KingdomScene.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Produces: `PROGRESSION_CROSSFADE_MS = 900`, `CONTROL_REVEAL_DELAY_MS = 550`, `RESOURCE_POPUP_MS = 1400`, and `getProgressionStage(state: GameState): number`.

- [ ] **Step 1: Write failing tests** for the exact timing constants and a monotonically increasing progression-stage value from decrepit Farm through Castle.
- [ ] **Step 2: Run `npm test -- --run src/game/interactionMotion.test.ts`** and confirm it fails because the module does not exist.
- [ ] **Step 3: Implement the constants and pure stage selector** without Phaser or DOM dependencies.
- [ ] **Step 4: Run the focused test** and confirm it passes.
- [ ] **Step 5: Update `KingdomScene.syncState`** to compare progression stages, place a new texture image above the outgoing wide background, tween its alpha from zero to one for 900ms, then destroy the outgoing image; swap instantly for reduced motion.
- [ ] **Step 6: Update `main.ts`** to delay rendering newly available controls for 550ms after a progression-stage increase while updating resources and the scene immediately.
- [ ] **Step 7: Update resource feedback** to use a larger high-contrast label, 1400ms lifetime, slow rise, and a delayed fade; reduced motion holds the label stationary for its readable lifetime.

### Task 3: Anchored Phaser hit areas and live responsive rebuilds

**Files:**
- Modify: `src/game/KingdomScene.ts`
- Modify: `src/game/createKingdom.ts`
- Modify: `src/game/worldLayout.test.ts`

**Interfaces:**
- Consumes: `getWorldMode`, `WorldLayout.hitAreas`, and `getWorldProjection`.
- Produces: `KingdomScene.resizeWorld(width: number, height: number): void` called by the Phaser scale resize event.

- [ ] **Step 1: Add failing layout assertions** proving projected Farm and Lumber hit rectangles remain centered on their normalized artwork anchors at representative desktop and mobile dimensions.
- [ ] **Step 2: Run the focused layout tests** and confirm the assertions fail before the footprint implementation is consumed.
- [ ] **Step 3: Replace sprite pixel-perfect interaction with invisible Phaser zones** projected from each normalized footprint; enable only actions available in the current progression state and preserve the hand cursor for interactive work sites.
- [ ] **Step 4: Add a resize handler** that clears world-owned display objects and tweens, redraws with the current container projection, recreates villagers/effects, and switches between narrow and wide modes when crossing 680px.
- [ ] **Step 5: Ensure `createKingdom` forwards container resize dimensions through Phaser's resize event** and DOM control rendering reads the same game container dimensions.
- [ ] **Step 6: Run `npm test -- --run src/game/worldLayout.test.ts`** and confirm it passes.

### Task 4: Floating and delayed control presentation

**Files:**
- Modify: `src/styles.css`
- Modify: `src/main.ts`
- Modify: `src/game/controlVisibility.test.ts`

**Interfaces:**
- Consumes: `CONTROL_REVEAL_DELAY_MS` and shared projected control anchors.

- [ ] **Step 1: Add a failing control-state test** proving pre-restoration shows only the Farm prompt and post-restoration exposes Farm plus Lumber Camp while later states expose only built sites and the next build site.
- [ ] **Step 2: Run `npm test -- --run src/game/controlVisibility.test.ts`** and confirm any missing progression case fails.
- [ ] **Step 3: Render controls from the visibility selector** and add a child wrapper so the outer element keeps its projected translation while the child animates vertically by 3px over three seconds.
- [ ] **Step 4: Add a short opacity entrance transition** for newly revealed controls and disable both entrance and float motion under `prefers-reduced-motion`.
- [ ] **Step 5: Run the focused control tests** and confirm they pass.

### Task 5: Full verification and browser QA

**Files:**
- Modify only files required by failures discovered in this task.

- [ ] **Step 1: Run `npm test`** and require all tests to pass.
- [ ] **Step 2: Run `npm run build`** and require TypeScript and Vite to complete successfully.
- [ ] **Step 3: Run `git diff --check`** and require no whitespace errors.
- [ ] **Step 4: In a fresh browser state, click the decrepit Farm** and verify a 900ms crossfade, no false `+1`, delayed Farm/Lumber controls, and aligned Farm hit area.
- [ ] **Step 5: Click the restored Farm** and verify the larger `+1` remains legible for about 1.4 seconds.
- [ ] **Step 6: Build the Lumber Camp** and verify it uses the same crossfade and that its control remains centered below the clearing.
- [ ] **Step 7: Resize desktop width and height repeatedly** and verify background, controls, hit areas, villagers, and effects remain attached to their artwork anchors.
- [ ] **Step 8: Enter Chrome mobile emulation without reloading, then return to desktop** and verify the world switches modes in both directions while retaining state.
