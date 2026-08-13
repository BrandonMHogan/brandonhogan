# Kingdom Initial Load Reveal

## Goal

Prevent the kingdom artwork from popping into view during initial page load while keeping Brandon's profile visible and useful immediately.

## Experience

- The page opens on the existing light-blue sky background.
- The profile portrait, introduction, and links appear immediately.
- The Phaser canvas, kingdom controls, and resource HUD remain hidden while the scene and its required textures load.
- After Phaser has created and rendered the complete initial scene, those three kingdom layers fade in together over approximately 800 milliseconds.
- The reveal is readiness-based and adds no artificial multi-second delay.
- When reduced motion is preferred, the completed kingdom appears immediately without a fade.

## Readiness contract

`KingdomScene` reports readiness only after its `create` work has completed and its initial state has been applied. `createKingdom` exposes that signal to `main.ts`. The page shell owns the visual loading state so the Phaser canvas and related HTML overlays cannot reveal independently.

The loading state must be established in the initial HTML/CSS, before the module script runs. This prevents a flash of the HUD or controls on slower script loads. JavaScript removes that state only after the scene-ready signal.

## Failure behavior

If Phaser fails to initialize, the profile stays visible against the existing fallback background. The page uses its current accessible status message for the failure and does not reveal unusable kingdom controls.

## Accessibility

- The profile and navigation remain available throughout loading.
- The hidden HUD and controls are not interactive until the kingdom is ready.
- No repetitive live-region loading announcement is added.
- `prefers-reduced-motion: reduce` disables the reveal transition.

## Verification

- A deterministic unit test covers the scene-ready callback boundary.
- A deterministic unit test covers the page reveal state, including reduced motion where practical.
- The full test suite and production build pass.
- Browser verification throttles or delays asset loading and confirms that the profile appears over blue, the kingdom layers never appear separately, and the completed scene fades in as one composition.
- Browser verification confirms the existing failure fallback and a narrow viewport remain usable.
