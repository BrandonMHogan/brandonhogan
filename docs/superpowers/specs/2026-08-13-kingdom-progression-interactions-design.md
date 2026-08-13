# Kingdom Progression Interaction Polish

## Scope

Polish every building progression interaction in the wide kingdom prototype without changing the approved progression artwork. The Farm, Lumber Camp, Town, Quarry, and Castle must use consistent transition and interaction behavior.

## Progression transitions

- Every progression background change uses a 900ms crossfade from the current approved background to the next approved background.
- The outgoing background remains visible beneath the incoming background until the crossfade finishes, preventing a flash or abrupt texture replacement.
- Controls unlocked by the progression change fade in during the final 350ms of the background transition.
- The initial Farm click restores the Farm without granting food. Normal gathering begins on subsequent Farm clicks.
- With reduced motion enabled, the background swaps immediately and controls appear without animation.

## Building controls

- Farm controls sit directly above the Farm rather than to its left.
- Lumber Camp controls are horizontally centered on the camp clearing and lowered out of the trees.
- Town, Quarry, and Castle controls remain associated with their landmarks and receive the same floating treatment.
- All visible site controls float vertically by no more than 3px on an approximately three-second cycle.
- Reduced motion disables the floating animation.

## Responsive projection and anchoring

- The background, HTML controls, Phaser hit areas, villagers, effects, and resource popups share one world projection derived from the game container's current dimensions.
- Every UI anchor and hit area is stored as a normalized point or footprint on the source artwork. Nothing is positioned independently with viewport CSS coordinates.
- When the page or game container changes size, the background is re-scaled and cropped using the same projection that repositions every anchored element. Controls therefore remain attached to their landmarks at every supported viewport shape.
- Resizing must not leave the existing background transform frozen while only the HTML controls move.
- The wide artwork retains its approved focal-point cover crop. The narrow artwork retains its existing narrow projection.
- A resize that crosses the layout breakpoint rebuilds the world in the new mode instead of retaining objects created for the previous mode.

## Mobile layout

- Widths below 680 CSS pixels use narrow mode for both Phaser and HTML controls. The breakpoint decision comes from one shared function rather than separate media-query and scene calculations.
- Entering Chrome mobile emulation after a desktop load must switch the running prototype to narrow mode without requiring a manual reload.
- Loading the page initially at a mobile width must also start directly in narrow mode.
- Returning from mobile width to desktop width must rebuild the wide progression background for the current saved state and restore every anchor to the wide artwork.
- Mobile and desktop must preserve the same progression state, crossfade rules, and interaction availability.

## Hit areas

- Each progression location uses an explicit, invisible hit area sized for its full visual footprint rather than relying on pixel-perfect clicks against a standalone building sprite.
- The Farm hit area covers most of the fenced Farm footprint.
- Lumber Camp, Town, Quarry, and Castle hit areas similarly cover most of their visible site or construction footprint.
- Interactive work sites retain a hand cursor. Locked sites do not perform actions before their progression step is available.
- Hit areas must remain aligned with the projected 3840x1917 artwork at different desktop viewport shapes.

## Resource feedback

- Resource gain text is approximately 20px and uses a strong contrasting outline or shadow.
- Each popup remains on screen for about 1.4 seconds.
- It rises slowly and begins fading only near the end of its lifetime.
- Restoration and construction clicks do not display a false resource gain.
- Reduced motion keeps the popup readable without relying on travel animation.

## Verification

- Pure layout tests cover control anchors and projected hit-area placement.
- Projection tests cover resize alignment and the shared 680px mode boundary.
- A scene resize test or deterministic scene-level contract proves that crossing the breakpoint rebuilds the world in the correct mode.
- Scene behavior tests cover progression texture selection and transition duration contracts where practical.
- Model tests continue to prove that the first Farm click restores without granting food.
- The full automated test suite, production build, and diff checks must pass.
- Desktop browser verification must cover a fresh Farm restoration, a normal Farm gather, and at least one later building transition.
- Browser verification must also resize an already-running desktop session into Chrome mobile dimensions and back, confirming that the background and all anchored elements switch modes together.
