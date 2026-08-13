# Animated Sky Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace cropped baked clouds with layered animated clouds, synchronize a sun/moon arc to the day/night cycle, and stabilize world scale on wide screens.

**Architecture:** Deterministic helpers calculate capped world projection and celestial positions. Phaser owns two wrapping cloud bands and sun/moon sprites behind gameplay objects, while empty/completed backgrounds contain clean sky only.

**Tech Stack:** TypeScript, Phaser 4, Vitest, ImageMagick, generated pixel-art PNG/WebP assets

## Global Constraints

- Preserve the current map, progression, persistence, and five-minute phase duration.
- Keep all cloud sprites complete, transparent, and free of cropped edges.
- Respect `prefers-reduced-motion`.
- Keep the profile borderless and readable above the sky layers.

---

### Task 1: Responsive projection

**Files:** `src/game/worldLayout.ts`, `src/game/worldLayout.test.ts`

- [ ] Add failing ultrawide projection tests that cap map scale by viewport height.
- [ ] Implement width-and-height capped projection with centered artwork.
- [ ] Run the focused tests.

### Task 2: Clean backgrounds and sky sprites

**Files:** `assets/game-source/kingdom/`, `public/assets/game/kingdom/`

- [ ] Produce cloud-free empty/completed wide and narrow backgrounds without changing terrain.
- [ ] Create complete transparent cloud, sun, and moon pixel sprites.
- [ ] Validate transparent padding, dimensions, and runtime WebP output.

### Task 3: Deterministic celestial cycle

**Files:** `src/game/skyCycle.ts`, `src/game/skyCycle.test.ts`

- [ ] Add failing tests for rise, zenith, and set coordinates.
- [ ] Implement deterministic arc coordinates from phase progress.
- [ ] Run focused tests.

### Task 4: Phaser sky layers

**Files:** `src/game/KingdomScene.ts`

- [ ] Preload sky sprites and create two cloud bands behind gameplay.
- [ ] Wrap clouds continuously and stop drift for reduced motion.
- [ ] Render sun/moon positions from phase elapsed time and synchronize tint/stars.

### Task 5: Verification

**Files:** `public/assets/game/kingdom/README.md`

- [ ] Document the layered sky assets.
- [ ] Inspect wide and narrow live layouts and one phase handoff.
- [ ] Run all tests, production build, and `git diff --check`.
