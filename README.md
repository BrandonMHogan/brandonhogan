# brandonhogan.com

Brandon Hogan's profile and portfolio website. It is a small static site built
with HTML, CSS, and vanilla TypeScript, using Vite for local development and
production builds.

## Requirements

- Node.js 20.19 or newer, or Node.js 22.12 or newer
- npm (included with Node.js)

## Run locally

Install the dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Vite prints the localhost URL in the terminal. The page reloads automatically
as source files change.

## Production build

Type-check the TypeScript and build the deployable site:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

## Kingdom prototype

The homepage includes an interactive retro-fantasy kingdom behind Brandon's
profile. Click unlocked resource locations to gather manually. Build the lumber
camp and town, recruit villagers, then assign them with the plus and minus
controls to automate production. The accelerated day/night cycle gathers every
visible villager at the lit town after dark.

Progress is saved in browser-local storage. The Reset control clears only the
kingdom save after confirmation.

The current Phaser scene uses custom 16-bit-style prototype maps and sprites in
`public/assets/game/kingdom/`. Asset provenance is documented in that folder.
The repository also retains Kenney's CC0 Tiny Town sheet for reference; its
original license is preserved at
`public/assets/game/kenney-tiny-town/LICENSE.txt`.
