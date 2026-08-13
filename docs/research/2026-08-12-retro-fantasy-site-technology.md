# Retro Fantasy Personal Site: Technology and Asset Research

Date: 2026-08-12

## Recommendation

Use **Phaser 4.2.x inside the existing Vite + vanilla TypeScript site**, while keeping Brandon's photo, introduction, and links as ordinary semantic HTML/CSS layered above the game canvas.

Use:

- **Phaser** for the landscape, buildings, sprite animation, clicks/taps, villagers, movement, parallax, day/night presentation, floating resource numbers, and responsive canvas scaling.
- **Regular HTML/CSS** for the always-visible floating profile and the bottom resource/status controls. This preserves selectable text, keyboard access, search indexing, graceful fallback, and straightforward responsive typography.
- **Plain TypeScript domain state plus native `localStorage`** for progression. This game is small enough that a state framework or persistence dependency would add complexity without buying anything useful.
- **Pixel Frog's Tiny Swords** as the first art pack to prototype against. It is almost uncannily aligned with this concept: human pawns, buildings, gathering resources, terrain, animated bushes/rocks, clouds, UI, and source Aseprite files in one coherent style.

No separate parallax, tweening, sprite-animation, physics, pathfinding, or state-management library is warranted for version one.

## Why Phaser is the best fit

Phaser is a game framework rather than only a renderer. The latest package at the time of research is 4.2.1, published in July 2026; it ships TypeScript declarations, uses the MIT license, supports Vite, and is commercially maintained. Its full production build is approximately 1.29 MB minified / 345 KB gzip, and the official package documentation says custom builds can omit unused systems ([Phaser package and size details](https://www.npmjs.com/package/phaser), [official package metadata](https://github.com/phaserjs/phaser/blob/master/package.json), [Phaser 4 releases](https://github.com/phaserjs/phaser/releases)).

That is larger than a bare rendering library, but it directly supplies nearly every piece this site needs:

- sprite sheets and frame animation for walking villagers, building loops, smoke, lights, and crops ([animations](https://docs.phaser.io/phaser/concepts/animations));
- tweens for villager paths, profile-like bobbing, build entrances, and rising/fading `+1` feedback ([tweens](https://docs.phaser.io/phaser/concepts/tweens));
- synchronized clocks and repeating timers for production ticks and day/night phases ([time](https://docs.phaser.io/phaser/concepts/time));
- pointer input for both mouse and touch ([input manager](https://docs.phaser.io/api-documentation/class/input-inputmanager));
- cameras and per-object scroll factors expressly intended for parallax ([game-object scroll factors](https://docs.phaser.io/phaser/concepts/gameobjects), [cameras](https://docs.phaser.io/phaser/concepts/cameras));
- responsive canvas scale management for a fixed virtual world fitted into varying browser viewports ([scale manager](https://docs.phaser.io/phaser/concepts/scale-manager)).

Phaser's v4 renderer is new, but it is not an abandoned beta: v4.0 shipped in April 2026 and active maintenance has already reached 4.2.1. Its v4 release also added a rebuilt WebGL renderer, unified filters, and GPU tile/sprite layers ([Phaser releases](https://github.com/phaserjs/phaser/releases)). For a new, contained project, starting on the current major is more sensible than building new work on Phaser 3 and inheriting a future migration.

### Bundle implication

The engine adds a meaningful initial download to a currently tiny personal page. Mitigate that by rendering the profile immediately as HTML and **dynamically importing Phaser and game assets after the profile shell is present**. A visitor looking Brandon up gets useful content immediately; the kingdom can initialize a moment later. Do not load physics engines because the game does not need collision simulation.

## Recommended page architecture

```text
viewport shell (HTML/CSS, 100dvh)
├── accessible profile (HTML, floating visually above the world)
│   ├── photo
│   ├── name and short introduction
│   └── intentional links
├── game mount
│   └── Phaser canvas
│       ├── sky gradient / day-night treatment
│       ├── cloud and distant-land parallax layers
│       ├── terrain and building slots
│       ├── building sprites and click targets
│       ├── villagers (one sprite per recruited villager)
│       └── transient +resource effects
└── resource HUD and accessible actions (HTML)
    ├── food / wood / people / stone
    ├── contextual build and recruit controls
    └── reset progress
```

Phaser can render DOM elements, but its own documentation notes that DOM elements sit above or below the canvas as a whole and do not truly interleave with canvas sprites. A normal sibling overlay is simpler for this fixed profile and HUD ([Phaser DOM elements](https://docs.phaser.io/phaser/concepts/gameobjects/dom-element)).

Use a fixed logical artboard (for example, a wide landscape coordinate system) and fit it into `100dvh`. On narrow portrait screens, recompose the same world rather than exposing a scrollable map: reduce the profile's footprint, tighten building coordinates, and use a compact HUD. The simulation state should be independent from these coordinates so desktop/mobile layout is just a view concern.

## Implementing the requested effects without more libraries

### Parallax and ambient movement

Split the view into a few cheap layers: sky color, far clouds, distant hills, near treeline, and playable ground. Move each at a different slow rate with camera scroll factors or repeating tile sprites. Phaser documents fractional scroll factors specifically for parallax; `TileSprite` is intended for repeating, scrollable textures ([scroll factors](https://docs.phaser.io/phaser/concepts/gameobjects), [tile sprites](https://docs.phaser.io/phaser/concepts/gameobjects/tile-sprite)).

Avoid a perpetually moving camera just to prove that parallax exists. Slow cloud drift, slight treetop motion, smoke, and occasional birds will create depth without competing with the profile.

### Villagers

Create exactly one visual villager entity for every recruited villager ID. An assignment changes behavior, not population:

- idle/day: wander between safe waypoints;
- assigned/day: cycle between town and workplace or wander near the workplace;
- night transition: finish or cancel the current short leg, then walk to a town entrance;
- night: hide indoors or gather at a small set of doorway/window/party positions while the town switches to lit frames;
- dawn: leave town and resume the assigned route.

Simple waypoint selection plus Phaser tweens is enough. A navigation mesh, A*, and physics would be needless machinery for six or seven fixed locations.

If a player's population eventually exceeds what remains pleasant to draw, that is a game-balance/layout limit to solve—not a reason to show fewer sprites. The explicit design promise is one villager on screen per recruited person.

### Day/night

Drive a deterministic visual cycle from the scene clock. Interpolate sky colors and apply a translucent cool-color overlay or camera color treatment; swap town windows/firelight to bright animated frames at night. Keep the cycle cosmetic in version one so a returning player is not punished because production happened during a night phase.

Respect reduced-motion preferences: retain the state changes and readable contrast, but slow or disable bobbing, parallax, resource-float spam, and nonessential wandering for users who request reduced motion.

### Incremental feedback

Manual clicks and automated production call the same resource-grant function. The simulation emits a presentation event such as `{ location: "farm", resource: "food", amount: 2 }`; Phaser pools or creates a small bitmap-text label, tweens it upward while fading, and removes it. Batch rapid automated ticks so late-game feedback remains legible rather than becoming a wall of `+1`s.

## State and persistence

Keep authoritative game rules in plain TypeScript outside the Phaser scene. Phaser should render state and relay intent; it should not own the save format. A minimal versioned save can contain:

```ts
interface SaveV1 {
  version: 1;
  resources: { food: number; wood: number; stone: number };
  unlocked: { farm: true; lumberCamp: boolean; town: boolean; quarry: boolean; castle: boolean };
  villagers: Array<{ id: string; assignment: "idle" | "farm" | "lumberCamp" | "quarry" }>;
  lastSavedAt: number;
}
```

Use one namespaced `localStorage` key, validate parsed data defensively, and save after purchases/assignments plus on a short debounce. `localStorage` persists across browser sessions, though private browsing storage is cleared when the private session ends ([Web Storage standard](https://html.spec.whatwg.org/multipage/webstorage.html#the-localstorage-attribute)).

`lastSavedAt` permits optional offline catch-up. Cap elapsed time (for example, several hours) and compute gains from assigned workers at load rather than trying to replay every tick. The reset control should require a confirmation and then remove only this game's namespaced key.

The intended 30–60 minute arc should come from a small data table of costs, base yields, worker rates, and town recruitment costs. Keep it configurable and test the economy independently of rendering.

## Framework comparison

| Option | Current status | Strength here | Cost here | Decision |
|---|---|---|---|---|
| **Phaser 4.2.x** | Active, MIT, current release 4.2.1 | Complete 2D game loop: input, animation, tweens, clocks, scale, cameras, layers, loaders | Largest runtime; new major version | **Choose** |
| **PixiJS 8.19.x** | Active, MIT | Excellent high-performance renderer; sprites, scene graph, ticker, input, responsive resize, filters | Intentionally renderer-first; we would design more game conventions and utilities ourselves | Reject for v1 |
| **KAPLAY** | Active Kaboom successor, MIT | Pleasant component API, TypeScript, Vite, quick prototyping | Smaller ecosystem and fewer built-in systems/long-term track record than Phaser for a polished personal centerpiece | Keep as prototype fallback |
| **Kaboom** | Archived November 2024 | Simple API | Upstream is read-only and superseded by KAPLAY | Reject |
| **Excalibur** | Active TypeScript game engine | Actor/scene lifecycle and strongly TypeScript-oriented API | Capable, but no material advantage over Phaser for this sprite-heavy diorama; smaller art/tutorial ecosystem | Reject |

PixiJS's official documentation describes it as primarily a rendering library. It supplies a scene graph, asset system, requestAnimationFrame ticker, pointer/touch events, filters, and automatic resize support, but the incremental-game structure and higher-level conventions remain ours to assemble ([architecture](https://pixijs.com/8.x/guides/concepts/architecture), [render loop](https://pixijs.com/8.x/guides/concepts/render-loop), [events](https://pixijs.com/8.x/guides/components/events), [resize](https://pixijs.com/8.x/guides/components/application/resize-plugin), [PixiJS 8.19 package metadata](https://github.com/pixijs/pixijs/blob/dev/package.json)). Pixi is the right alternate if custom rendering control becomes more important than implementation speed.

The original Kaboom repository was archived by its owner on 2024-11-12 ([Kaboom repository](https://github.com/replit/kaboom)). KAPLAY is the maintained TypeScript fork/successor with a similar component model and bundler support ([KAPLAY repository](https://github.com/kaplayjs/kaplay), [migration from Kaboom](https://kaplayjs.com/docs/guides/migration-kaplay/)). It would be fun for a sketch, but there is no compelling benefit to choosing its younger ecosystem over Phaser for this particular site.

Excalibur is a reasonable maintained alternative with explicit engine, scene, actor, update, and draw lifecycles ([engine fundamentals](https://excaliburjs.com/docs/engine/), [scenes](https://excaliburjs.com/docs/scenes/)). It is not a wrong choice; it simply does not beat Phaser's match to the requested feature list.

## Art and asset options

### 1. Pixel Frog — Tiny Swords (primary recommendation)

[Tiny Swords](https://pixelfrog-assets.itch.io/tiny-swords) is the closest complete match found:

- human units/pawns and multiple faction colors;
- eight city buildings including houses and castles;
- gathering visuals for wood, food-related sheep, rocks, and repair work;
- terrain elevations, water edges, decorations, animated bushes/rocks, shadows, and clouds;
- UI pieces and icons;
- PNG exports plus Aseprite source files;
- a documented 64×64 grid and 10 fps animation cadence.

The creator permits personal and commercial use and modification, with no attribution required; redistribution/resale/repackaging of the assets is forbidden. Preserve the downloaded license alongside the source assets, and do not publish raw source/Aseprite files as downloadable site files. The page also offers an older explicitly CC0-licensed version, but the current free pack's fuller custom license is still suitable for a public personal site. The pack was being actively updated in May 2026 ([pack, contents, and license](https://pixelfrog-assets.itch.io/tiny-swords)).

Potential gaps: the pack's tone leans colorful RTS rather than cozy farming, and it may not contain a farm/quarry image matching the exact progression. Its Aseprite sources make restrained modifications possible, but verify the downloaded contents before locking the final art direction.

### 2. Kenney — CC0 prototype/fallback

Kenney states that assets on its asset pages are CC0, including commercial use, modification, and no attribution requirement ([Kenney licensing FAQ](https://kenney.nl/support)). Useful candidates include:

- [Tiny Town](https://kenney.nl/assets/tiny-town) for a small pixel settlement prototype;
- [Medieval RTS](https://kenney.nl/assets/medieval-rts) for buildings and terrain;
- [Retro Fantasy Kit](https://www.kenney.nl/assets/retro-fantasy-kit) or [Fantasy Town Kit](https://kenney.nl/assets/fantasy-town-kit) if the project intentionally pivots toward a rendered 3D/isometric-retro appearance.

Kenney is the lowest licensing-risk route, but its packs may require mixing sets or commissioning/custom-drawing the missing villagers and building states. Mixing unrelated packs should be avoided unless palette, scale, outlines, perspective, and shadow direction can be normalized.

### 3. Carefully licensed marketplace packs

Itch.io is a legitimate source when buying/downloading directly from the artist, but each asset page has its own license. Shortlist packs based on one coherent set covering buildings, terrain, and four-direction characters—not individual attractive sprites.

Examples worth visually testing:

- [Fantasy Farm by mihapomelo](https://mihapomelo.itch.io/farm-fantasy-asset-pack): 32×32 top-down environment, running character, crops, animals, and action animations; commercial/non-commercial modification allowed, redistribution prohibited.
- [Top Down Kingdom by philtacular](https://philtacular.itch.io/top-down-kingdom): 32×32 kingdom tiles/props, animated buildings, and four-direction characters; paid, with its included license controlling use.
- [Castle and Village by edermunizz](https://edermunizz.itch.io/castle-and-village-pixel-art-pack): 16×16 terrain, houses, castle pieces, clouds, smoke, and tiny villagers; paid and listed as CC BY 4.0 with supplemental restrictions on redistribution and blockchain uses.
- [Tiny Kingdom by ActuallyElmo](https://actuallyelmo.itch.io/tiny-kingdom): small village/castle pack with terrain and animated windmill/buildings; creator permits personal/commercial use and does not require attribution.

Before importing any marketplace pack, save a copy of the license and purchase receipt, confirm web-game use is allowed, confirm whether source files can be committed to a public repository, and confirm that derived sprites may be served as part of the compiled site.

## Suggested technical spike before committing to full production

Build a one-screen, disposable vertical slice with:

1. the existing profile rendered as floating HTML over a Phaser canvas;
2. three parallax layers and a basic day/night interpolation;
3. one clickable farm that emits rising `+1` text;
4. five Tiny Swords pawn sprites, each following independent day waypoints and converging on one town entrance at night;
5. the centered HTML resource HUD;
6. responsive layouts tested at wide desktop, short laptop, and narrow phone sizes;
7. save, reload, capped offline gain, and reset.

This spike answers the real risks—art fit, profile readability, one-viewport composition, mobile touch targets, and whether five-to-ten moving villagers feel charming rather than noisy—before implementing the full economy.

## Final decision

Proceed with **Phaser 4.2.x + semantic HTML/CSS overlay + native TypeScript state/localStorage**, prototype visually with **Tiny Swords**, and avoid additional engine-adjacent dependencies until a demonstrated need appears. The core uncertainty is now art direction and responsive composition, not framework capability.
