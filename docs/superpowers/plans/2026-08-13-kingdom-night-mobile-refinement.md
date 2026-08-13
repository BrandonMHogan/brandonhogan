# Kingdom Night and Mobile Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine Town night lighting and keep mobile celestial bodies and Castle controls clear of gameplay while polishing Lumber Camp placement.

**Architecture:** Extend pure layout, visibility, and celestial helpers so behavior is deterministic and testable. `KingdomScene` consumes those contracts to render anchored window lights and mode-specific celestial sizing without changing approved artwork.

**Tech Stack:** TypeScript, Phaser 3, DOM/CSS, Vitest, Vite.

## Global Constraints

- Do not edit approved progression backgrounds.
- Do not show a post-build Castle control.
- Do not render the old Town glow circle.
- Narrow celestial art must remain inside the upper sky.
- Reduced motion keeps lighting state changes immediate.

### Task 1: Layout and visibility contracts

**Files:** `src/game/worldLayout.ts`, `src/game/worldLayout.test.ts`, `src/game/controlVisibility.ts`, `src/game/controlVisibility.test.ts`

- [ ] Write failing tests for separate Lumber build/built anchors, narrow Castle build anchoring, and no completed-Castle control.
- [ ] Run focused tests and confirm failures.
- [ ] Implement the minimal layout and visibility changes.
- [ ] Run focused tests and confirm success.

### Task 2: Mobile celestial safe zone

**Files:** `src/game/skyCycle.ts`, `src/game/skyCycle.test.ts`, `src/game/KingdomScene.ts`

- [ ] Write failing tests for a narrow-mode arc whose centers stay within the top 30 percent of the viewport.
- [ ] Run the focused test and confirm failure.
- [ ] Add a mode argument to celestial positioning and mode-specific scale in the scene.
- [ ] Run the focused test and confirm success.

### Task 3: Anchored Town window lights

**Files:** `src/game/KingdomScene.ts`

- [ ] Replace `townGlow` with a container of small warm window rectangles projected from normalized offsets around the Town anchor.
- [ ] Show lights only when Town is built and night is active; fade them at phase changes and recreate them on resize.
- [ ] Run the full test suite and production build.
- [ ] Verify wide night presentation and desktop-to-mobile resizing in the browser.
