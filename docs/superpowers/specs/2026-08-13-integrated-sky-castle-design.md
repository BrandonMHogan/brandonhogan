# Integrated Sky and Castle Design

## Goal

Make the profile feel suspended inside the illustrated sky and make the completed castle feel painted into its hill rather than overlaid as a sprite.

## Visual design

- Extend the wide and narrow world artwork upward with a continuous pixel-art sky so the viewport never exposes a separate CSS-blue region or a hard horizontal seam.
- Position the profile within the cloud layer just above the castle. Keep it borderless and floating; strengthen the subtitle and links with brighter color, medium weight, and a compact dark-blue shadow.
- Maintain two versions of each world background: an empty hilltop before construction and the same hilltop with the castle painted directly into the terrain.
- Preserve the existing map, buildings, paths, controls, villagers, palette, 16-bit pixel scale, and quarter-top-down perspective.

## Runtime design

Phaser preloads empty and completed wide/narrow backgrounds. The empty background is always the base image; a completed-world image above it crossfades in when `state.unlocked.castle` becomes true. The separate castle sprite is removed, while the existing castle build/completion control remains positioned over its hill.

## Responsive behavior

The extended artwork remains aspect-ratio preserving and bottom anchored. Wide and narrow images each include enough added sky to cover their intended viewport shape. Profile positioning uses viewport clamps so it remains in the cloud layer without overlapping the resource HUD.

## Verification

- Unit-test the world-background texture selection and castle-layer visibility contract.
- Verify locked and completed castle states in the live browser.
- Check wide and narrow viewport screenshots for a continuous sky, profile readability, and hill integration.
- Run the full test suite, production build, and whitespace validation.
