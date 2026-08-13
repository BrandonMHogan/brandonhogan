# Retro Kingdom Prototype Design

## Goal

Validate that Brandon's personal profile and a charming retro-fantasy incremental kingdom can coexist as a polished, interactive, single-viewport website.

## Experience

The profile is always visible as unboxed, gently floating HTML typography in the sky. It contains Brandon's photo, name, short software-engineering introduction, GitHub, LinkedIn, and email links. The kingdom grows around and below it without gating or obscuring the profile.

The prototype begins with a farm. Clicking the farm grants food and creates a rising resource number. Resources unlock a lumber camp and a town. The town recruits villagers; each recruited villager has exactly one visible sprite. Villagers can be assigned to production locations using small minus/count/plus controls below buildings. The prototype may abbreviate the full Farm -> Lumber Camp -> Town -> Quarry -> Castle economy, but must prove purchasing, recruiting, worker automation, persistence, and reset with representative locations.

## Living World

The scene uses an authentic low-detail 16-bit art direction: a three-quarter top-down 320x180-style logical canvas, approximately 16x16 terrain tiles, compact villagers, a limited palette, repeated modular tiles, and broad calm grass areas. The Farm belongs to crop fields, the Lumber Camp sits inside a forest, the Town anchors the paths, the Quarry is carved into a mountain, and the Castle occupies high ground.

Day and night each last five minutes. During the day, villagers wander or move around their workplaces. At night, every villager travels to the town, the town becomes warmly lit, and the villagers appear to gather there. At dawn they return to daytime behavior. Automatic production runs only while assigned villagers are physically at work; it pauses while they travel and throughout the night. Manual location clicks remain available at any time.

Population is capped at ten so the one-villager-to-one-sprite promise never overcrowds the map. Recruiting begins at 25 food and increases by 10 food per existing villager, ending at 115 food for the tenth villager.

## Interface

The scene is the interface. Clicking productive buildings performs their manual action. Transient resource gains rise and fade directly from the source. Worker controls sit under the relevant building. Locked sites show unboxed requirements over their future location; an in-place Build control appears when affordable. A compact centered HUD at the bottom shows total resources, population, time of day, and reset.

The complete composition fits within the browser viewport without page scrolling on desktop, short laptop, and phone layouts. The HTML profile and HUD remain usable above the Phaser canvas. Reduced-motion preferences suppress nonessential bobbing, parallax, wandering, and repeated floating feedback.

## Architecture

- Vite and TypeScript remain the application shell.
- Semantic HTML/CSS own the profile, external links, live resource HUD, building controls, and reset confirmation.
- Phaser 4 owns the canvas landscape, parallax layers, buildings, sprites, movement, day/night presentation, and transient resource effects.
- Plain TypeScript owns authoritative game rules, costs, production, assignments, and time calculations independently of Phaser.
- A versioned save is stored under one namespaced `localStorage` key. Invalid saves fall back safely, offline gains are capped, and reset removes only that key.
- Phaser is dynamically imported after the immediately useful HTML shell renders.

## Prototype Success Criteria

- The profile remains readable and interactive while the canvas runs behind it.
- A farm click visibly and numerically grants food.
- At least one building can be purchased and appears in its reserved world position.
- The town can recruit five villagers, producing exactly five visible villager sprites.
- Workers generate resources automatically after assignment.
- All villagers converge on the lit town at night and resume movement after dawn.
- Refresh restores progress; offline catch-up is bounded; reset starts a fresh game.
- The page has no vertical scrolling at representative desktop and mobile viewport sizes.
- The project type-checks and builds as a static Vite site.

## Assets and Licensing

Prototype with a coherent pack whose license explicitly permits public web use and modification. Keep its license notice beside the source assets. Do not expose editable source art files in the production bundle. Tiny Swords is preferred; Kenney CC0 assets are an acceptable fallback if acquisition or visual integration blocks the prototype.
