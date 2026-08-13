# Retro Kingdom Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished interactive vertical slice of the single-screen retro-fantasy personal site.

**Architecture:** Keep the accessible profile and HUD in HTML/CSS, authoritative economy and persistence in framework-independent TypeScript, and render the animated kingdom with a dynamically loaded Phaser canvas. Connect them with typed commands, state snapshots, and presentation events.

**Tech Stack:** Vite, TypeScript, Vitest, Phaser 4.2.x, HTML/CSS, native localStorage

## Global Constraints

- Profile content is always visible and never gated by game progress.
- Everything must fit within one viewport without page scrolling.
- Every recruited villager must have exactly one visible sprite.
- Villagers wander by day and converge on a warmly lit town at night.
- The prototype must be interactive, persistent, resettable, responsive, and reduced-motion aware.
- Do not add separate animation, parallax, physics, pathfinding, or state-management libraries.

---

### Task 1: Tested economy and persistence core

**Files:** `src/game/model.ts`, `src/game/model.test.ts`, `src/game/storage.ts`, `src/game/storage.test.ts`, `package.json`, `package-lock.json`

**Interfaces:** Produces `createInitialState`, `reduceGame`, `advanceGame`, `getProductionRates`, `GameState`, `GameAction`, `loadGame`, `saveGame`, and `resetGame`.

- [ ] Add Vitest and a `test` script.
- [ ] Write failing tests for farm clicks, building purchases, recruiting, assignments, automated production, bounded offline gain, invalid saves, reload, and reset.
- [ ] Run the focused tests and confirm they fail for missing behavior.
- [ ] Implement the smallest plain-TypeScript economy and storage modules that satisfy the tests.
- [ ] Run the focused tests and confirm they pass.

### Task 2: Phaser world vertical slice

**Files:** `src/game/createKingdom.ts`, `src/game/KingdomScene.ts`, `src/game/worldLayout.ts`, `src/game/worldLayout.test.ts`, `public/assets/game/*`, `package.json`, `package-lock.json`

**Interfaces:** Consumes model snapshots and actions. Produces `createKingdom(mount, options)` returning `updateState`, `emitResourceGain`, and `destroy`.

- [ ] Acquire a coherent, web-licensed retro-fantasy asset set and preserve its license.
- [ ] Write a failing layout test proving desktop and mobile world slots remain in normalized bounds.
- [ ] Install Phaser and confirm the layout test fails for missing behavior.
- [ ] Implement a dynamically loaded Phaser scene with parallax, clickable buildings, build appearances, floating gains, day/night lighting, and one sprite per villager.
- [ ] Implement day waypoint movement and night convergence on the town without physics or pathfinding.
- [ ] Run the layout/model tests and confirm they pass.

### Task 3: Accessible profile, HUD, and game orchestration

**Files:** `index.html`, `src/main.ts`, `src/styles.css`

**Interfaces:** Consumes model, storage, and `createKingdom`. Produces the responsive shell, live HUD, contextual actions, save, and reset lifecycle.

- [ ] Replace legacy markup with the always-visible profile and game/HUD mount points.
- [ ] Wire ticking, scene synchronization, build/recruit/assignment controls, saving, offline catch-up, and confirmed reset.
- [ ] Style desktop, short-viewport, narrow-phone, focus, loading, error, and reduced-motion states without page scrolling.
- [ ] Keep external links semantic and HUD updates accessible.
- [ ] Run tests and production build.

### Task 4: Interactive visual verification and polish

**Files:** Task 2-3 files when verification exposes a defect; `README.md`

- [ ] Launch locally and inspect clicking, purchase, five villagers, assignment, day/night convergence, persistence, and reset.
- [ ] Inspect wide desktop, short laptop, and narrow phone sizes for clipping and scrolling.
- [ ] Verify keyboard access, focus, profile readability, and reduced-motion behavior.
- [ ] Fix observed defects with failing regression tests where behavior is testable.
- [ ] Document controls and asset licensing.
- [ ] Run complete tests, production build, and `git diff --check`.
