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
