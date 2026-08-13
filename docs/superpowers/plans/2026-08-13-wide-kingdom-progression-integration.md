# Wide Kingdom Progression Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run the approved six-state wide kingdom artwork in the existing prototype, beginning with a free first-click Farm restoration.

**Architecture:** The plain TypeScript model owns whether the Farm has been restored. A pure world-visual selector maps that state plus the existing unlock flags to one approved wide texture. Phaser swaps a single integrated wide background while retaining the existing narrow/mobile rendering and transparent interactive hit targets.

**Tech Stack:** TypeScript, Vitest, Phaser 4, ImageMagick, Vite.

## Global Constraints

- Use the six approved `3840×1917` source PNGs without regenerating or repainting them.
- The first Farm click restores the Farm for free and does not grant food.
- Later Farm clicks retain the existing food-gathering behavior.
- Do not add or finalize introductory prompt/button styling in this task.
- Preserve the existing animated-sky and responsive-layout work already present in the checkout.

---

### Task 1: Persist the Farm restoration state

**Files:**
- Modify: `src/game/model.ts`
- Modify: `src/game/model.test.ts`
- Modify: `src/game/storage.ts`
- Modify: `src/game/storage.test.ts`

**Interfaces:**
- Produces: `GameState.farmRestored: boolean`
- Produces: the existing `gather` action restores an unrestored Farm before gathering.

- [ ] **Step 1: Write failing model and storage tests**

Assert that a fresh state starts with `farmRestored === false`, the first Farm gather changes only that flag, the second grants one food, and a version-1 save loads with `farmRestored === true` so existing players do not lose access.

- [ ] **Step 2: Run the focused tests and verify the expected failures**

Run: `npm test -- src/game/model.test.ts src/game/storage.test.ts`

- [ ] **Step 3: Implement the minimal state and migration behavior**

Add `farmRestored` to `GameState`, gate Farm gathering in `reduceGame`, and normalize stored version-1 data when loading.

- [ ] **Step 4: Re-run the focused tests and verify they pass**

Run: `npm test -- src/game/model.test.ts src/game/storage.test.ts`

### Task 2: Select approved progression textures

**Files:**
- Modify: `src/game/worldVisuals.ts`
- Modify: `src/game/worldVisuals.test.ts`

**Interfaces:**
- Produces: `getWideProgressionTextureKey(state: GameState): string`

- [ ] **Step 1: Write a failing table-driven test for all six states**

Assert the exact keys for decrepit Farm, Farm, Lumber Camp, Town, Quarry, and full Castle.

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run: `npm test -- src/game/worldVisuals.test.ts`

- [ ] **Step 3: Implement the minimal selector**

Choose the furthest unlocked progression texture, with `farmRestored` selecting between the first two states.

- [ ] **Step 4: Re-run the focused test and verify it passes**

Run: `npm test -- src/game/worldVisuals.test.ts`

### Task 3: Add runtime assets and wire Phaser

**Files:**
- Create: `public/assets/game/kingdom/master-wide-farm-decrepit-v1.webp`
- Create: `public/assets/game/kingdom/master-wide-through-farm-v1.webp`
- Create: `public/assets/game/kingdom/master-wide-through-lumber-v1.webp`
- Create: `public/assets/game/kingdom/master-wide-through-town-v3.webp`
- Create: `public/assets/game/kingdom/master-wide-through-quarry-v1.webp`
- Use existing: `public/assets/game/kingdom/master-wide-full-approved.webp`
- Modify: `src/game/KingdomScene.ts`
- Modify: `src/main.ts`
- Modify: `public/assets/game/kingdom/README.md`

**Interfaces:**
- Consumes: `getWideProgressionTextureKey(state)` and `state.farmRestored`.
- Produces: a single integrated wide background that swaps after every state update.

- [ ] **Step 1: Convert approved PNGs to lossless WebP and verify each is `3840×1917`**

Use ImageMagick quality `90` with WebP method `6`; do not alter source PNGs. Keep the exact approved PNGs as the immutable masters while avoiding a multi-second six-image lossless preload.

- [ ] **Step 2: Preload and display the six wide texture keys**

Use the integrated backgrounds only in wide mode. Keep narrow mode on its existing background-plus-building system. Retain invisible wide building images as click hit targets and suppress Farm worker controls until restoration.

- [ ] **Step 3: Document the runtime sequence**

List each approved WebP and its corresponding progression state in the asset README.

- [ ] **Step 4: Run automated verification**

Run: `npm test`

Run: `npm run build`

- [ ] **Step 5: Inspect the browser at fresh and restored states**

Confirm the initial decrepit Farm renders, the first Farm click swaps to the finished Farm without adding food, later clicks add food, and the responsive mobile scene still renders.
