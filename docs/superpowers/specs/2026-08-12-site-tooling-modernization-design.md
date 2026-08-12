# Site Tooling Modernization Design

## Goal

Make the existing Brandon Hogan profile site easy to run and develop locally with current, maintainable tooling. Preserve its present content and visual design so later design work starts from a faithful local baseline.

## Scope

- Use Vite as the development server and production bundler.
- Use vanilla TypeScript for the site's small amount of client-side behavior.
- Retain the existing CSS and page appearance except for compatibility fixes required by the tooling upgrade.
- Modernize the document structure and metadata where this does not alter the design.
- Remove runtime dependencies that are unused by the current page: jQuery, Skel, and Poptrox.
- Add documented commands for local development, production builds, and local production previews.

The first pass will not introduce React or another UI framework, redesign the page, add portfolio content, or revive the commented gallery.

## Architecture

The site remains a small static application:

- `index.html` contains semantic page markup and loads the TypeScript entry point as an ES module.
- `src/main.ts` owns the avatar easter-egg interaction without a DOM library.
- Existing styles remain the visual baseline, with only targeted modernization such as secure resource URLs and removal of obsolete compatibility code when safe.
- Vite serves source files during development and emits a deployable static bundle for production.

There is no application state, backend, API, routing layer, or framework component model.

## Behavior and Failure Handling

The avatar continues to toggle its spin state when activated. The TypeScript code will tolerate a missing avatar element by doing nothing instead of throwing. Links and visible copy remain unchanged unless correcting clearly erroneous accessibility labels.

## Verification

- Install dependencies from the committed package manifest and lockfile.
- Run TypeScript checking and a Vite production build.
- Start the Vite development server and confirm the page responds on localhost.
- Inspect the rendered page at desktop and narrow viewport sizes for obvious regressions.
- Confirm the avatar interaction works without legacy JavaScript libraries.

## Developer Workflow

- `npm install` installs dependencies.
- `npm run dev` starts the development server.
- `npm run build` type-checks and creates the production bundle.
- `npm run preview` serves the production bundle locally.

