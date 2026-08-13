# Kingdom Initial Load Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the profile visible immediately and reveal the fully initialized kingdom canvas, controls, and HUD together without an aggressive pop-in.

**Architecture:** The HTML starts the shell in an explicit `is-loading` state. Phaser reports scene readiness through an `onReady` callback after initial scene creation; `main.ts` then delegates to a small reveal helper that swaps the shell to `is-ready`, while CSS owns the synchronized fade and reduced-motion behavior.

**Tech Stack:** Vanilla TypeScript, Phaser 4, CSS, Vitest, Vite

## Global Constraints

- The profile portrait, introduction, and links appear immediately over the existing light-blue sky background.
- The Phaser canvas, kingdom controls, and resource HUD remain hidden until the initial scene is ready.
- The three kingdom layers reveal together over approximately 800 milliseconds with no artificial delay.
- `prefers-reduced-motion: reduce` disables the reveal transition.
- Initialization failure keeps the profile and fallback background visible and does not expose unusable controls.
- Preserve unrelated untracked artwork in the checkout.

---

### Task 1: Loading-state contract

**Files:**
- Create: `src/game/initialReveal.ts`
- Create: `src/game/initialReveal.test.ts`

**Interfaces:**
- Produces: `revealKingdom(shell: HTMLElement): void`, which replaces `is-loading` with `is-ready`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { revealKingdom } from "./initialReveal";

describe("revealKingdom", () => {
  it("moves the shell from loading to ready", () => {
    const classList = new Set(["kingdom-shell", "is-loading"]);
    const shell = {
      classList: {
        add: (...names: string[]) => names.forEach((name) => classList.add(name)),
        remove: (...names: string[]) => names.forEach((name) => classList.delete(name)),
      },
    } as unknown as HTMLElement;

    revealKingdom(shell);

    expect([...classList]).toEqual(["kingdom-shell", "is-ready"]);
  });
});
```

- [ ] **Step 2: Run `npm test -- --run src/game/initialReveal.test.ts` and verify it fails because `initialReveal` does not exist.**

- [ ] **Step 3: Implement the minimal helper.**

```ts
export const revealKingdom = (shell: HTMLElement): void => {
  shell.classList.remove("is-loading");
  shell.classList.add("is-ready");
};
```

- [ ] **Step 4: Run `npm test -- --run src/game/initialReveal.test.ts` and verify it passes.**

### Task 2: Scene readiness and synchronized reveal

**Files:**
- Modify: `index.html`
- Modify: `src/game/KingdomScene.ts`
- Modify: `src/game/createKingdom.ts`
- Modify: `src/main.ts`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `revealKingdom(shell: HTMLElement): void` from Task 1.
- Adds: `onReady: () => void` to the options accepted by `createKingdom` and `KingdomScene`.

- [ ] **Step 1: Add `class="kingdom-shell is-loading"` to the initial `<main>` markup so the hidden state exists before JavaScript executes.**

- [ ] **Step 2: Add the loading and reveal CSS.**

```css
.is-loading .game,
.is-loading .world-controls,
.is-loading .hud { opacity:0; visibility:hidden; pointer-events:none }
.is-ready .game,
.is-ready .world-controls,
.is-ready .hud { opacity:1; visibility:visible; transition:opacity .8s ease }
@media(prefers-reduced-motion:reduce){
  .is-ready .game,.is-ready .world-controls,.is-ready .hud{transition:none}
}
```

- [ ] **Step 3: Add `onReady` to `SceneOptions` and invoke it at the end of `KingdomScene.create()` after the initial world, state, villagers, and event wiring are complete.**

- [ ] **Step 4: Add `onReady` to `createKingdom`'s options and pass it unchanged into `KingdomScene`.**

- [ ] **Step 5: Select `.kingdom-shell` in `main.ts`, import `revealKingdom`, and pass `onReady: () => requestAnimationFrame(() => revealKingdom(shell))` to `createKingdom`; leave the shell loading on the existing catch path.**

- [ ] **Step 6: Run `npm test` and confirm the complete suite passes.**

- [ ] **Step 7: Run `npm run build` and confirm TypeScript and Vite complete successfully.**

### Task 3: Browser verification

**Files:**
- Verify only; no expected source changes.

**Interfaces:**
- Consumes the completed page behavior from Tasks 1 and 2.

- [ ] **Step 1: Start `npm run dev -- --host 127.0.0.1` and open the local URL.**
- [ ] **Step 2: Confirm the profile appears over light blue before the kingdom and that the canvas, controls, and HUD fade in as one composition.**
- [ ] **Step 3: Confirm profile links work throughout loading, there is no horizontal overflow at 375px, and the console stays clean.**
- [ ] **Step 4: Emulate reduced motion and confirm the ready kingdom appears without a fade.**
