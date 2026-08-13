# Kingdom Calibration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct world scaling, building placement, castle art, cycle timing, and overlapping villager routes.

**Architecture:** Add pure world projection and route-variation helpers to `worldLayout.ts`. Make the Phaser scene and HTML overlay consume those helpers so every visible layer shares one coordinate system.

**Tech Stack:** TypeScript, Phaser 4, Vite, Vitest, generated PNG/WebP sprite assets.

## Global Constraints

- Preserve the approved three-quarter top-down 16-bit style.
- Keep the whole game within one viewport.
- Day and night each last 300,000 milliseconds.
- Automatic production runs only while villagers are physically at work.

---

### Task 1: Projection and route geometry

**Files:** Modify `src/game/worldLayout.ts`; modify `src/game/worldLayout.test.ts`.

- [ ] Write failing tests for native-aspect projection, five-minute timing, and distinct worker routes.
- [ ] Run the focused tests and confirm the expected failures.
- [ ] Implement the pure projection and route helpers.
- [ ] Run the focused tests and confirm they pass.

### Task 2: Scene and overlay integration

**Files:** Modify `src/game/KingdomScene.ts`; modify `src/main.ts`; modify `src/styles.css`.

- [ ] Project the background, buildings, effects, routes, and controls through the same transform.
- [ ] Calibrate per-building sizes and anchors.
- [ ] Stagger dawn departures and apply per-villager route lanes and work offsets.
- [ ] Re-render projection-dependent UI on viewport resize.

### Task 3: Castle asset and verification

**Files:** Create `assets/game-source/kingdom/building-4-centered.png`; create `public/assets/game/kingdom/building-4-centered.webp`; modify `src/game/KingdomScene.ts`.

- [ ] Add the centered-door castle sprite and runtime WebP.
- [ ] Run all tests, TypeScript compilation, production build, and `git diff --check`.
- [ ] Inspect tall, standard, and ultrawide desktop screenshots and check browser errors.
