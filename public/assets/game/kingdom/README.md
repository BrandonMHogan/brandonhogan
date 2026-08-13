# Kingdom Art Assets

These prototype assets were generated for `brandonhogan.com` with OpenAI's
built-in image-generation tool on 2026-08-12, then cropped into runtime sprites
with ImageMagick.

- `world.webp`: widescreen empty kingdom map
- `world-mobile.webp`: independently composed portrait kingdom map
- `world-empty-extended.webp` and `world-castle-extended.webp`: wide empty and
  completed states with continuous sky above the preserved playable map
- `world-mobile-empty-extended.webp` and `world-mobile-castle-extended.webp`:
  equivalent portrait state pair
- `building-0.webp` through `building-4.webp`: original Farm, Lumber Camp, Town,
  Quarry, and Castle sprites
- `building-4-centered.webp`: revised wider Castle with a centered entrance,
  generated from `building-4.png` as the visual reference on 2026-08-12
- `building-3-clean.webp`: clean standalone Quarry entrance generated from the
  original Quarry as a style reference, with no neighboring sprite fragment
- `building-3-family.webp` and `building-4-family.webp`: Quarry and Castle
  restyled against the Farm, Lumber Camp, and Town reference sheet so all five
  runtime buildings share one visual family
- `villager-00.webp` through `villager-15.webp`: walking and working animation
  frames
- `villager-woman-00.webp` through `villager-woman-15.webp`: matching woman
  walking and working frames, alternated with the man sprite by population index

Lossless PNG maps, source sheets, and cropped frames live outside the public
bundle in `assets/game-source/kingdom/`. Runtime code loads only the optimized
WebP maps and sprites in this folder.

The castle in the extended completed maps is painted directly into the hilltop;
it is not loaded as a separate runtime sprite.

The `*-sky-clean.webp` world pairs remove baked upper-sky clouds. Runtime sky
motion uses `cloud-0.webp` through `cloud-5.webp` in two parallax bands plus
`sun.webp` and `moon.webp`, whose arc is synchronized to the five-minute phase.

`master-wide-full-approved.webp` is the approved fully built wide progression
master (`3840×1917`). Earlier building states must be derived from this exact
composition without changing its crop, scale, terrain, or unaffected pixels.

The integrated wide runtime progression uses six high-quality `3840×1917` WebPs;
the exact approved PNG masters remain in `assets/game-source/kingdom/`:

1. `wide-farm-decrepit-v1.webp`: initial repairable Farm.
2. `wide-through-farm-v1.webp`: restored Farm.
3. `wide-through-lumber-v1.webp`: Farm and Lumber Camp.
4. `wide-through-town-v3.webp`: Farm, Lumber Camp, and Town.
5. `wide-through-quarry-v1.webp`: Farm, Lumber Camp, Town, and Quarry.
6. `wide-full-approved-v1.webp`: fully built kingdom with Castle.

The first Farm click restores the Farm for free. Narrow/mobile mode continues
to use the existing layered world and standalone building assets.
