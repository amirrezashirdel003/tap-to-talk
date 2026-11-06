# Tap to Talk

Tap to Talk is a Persian-first visual communication app concept for people who may find spoken communication difficult, including some older adults and people with speech difficulties. Users browse everyday categories and select pictogram-labelled items as an alternative way to express basic needs.

The project is an assistive communication concept, not a medical device or a substitute for professional care. The current published `main` branch is an early prototype and does **not** yet provide working Persian text-to-speech.

## Current status

The current GitHub `main` branch includes:

- A React single-page interface with a home page and category pages
- Eight predefined everyday categories with emoji labels
- Persian text labels displayed beside the emoji pictograms
- A browser speech-synthesis call when an item is selected
- A Vite PWA configuration and web app manifest

**Known prototype limitation:** The current category click handler speaks a hard-coded English “hello world” phrase using the `en-US` browser voice. It does not speak the selected Persian item. Therefore, the current GitHub version does not yet deliver spoken Persian output for its intended users. The Piper Persian voice, pronunciation handling, offline model preparation, and audio caching described in the local technical documentation are not part of the current GitHub `main` implementation.

## Technology

- React and React DOM
- JavaScript and JSX
- Vite
- React Router
- Vite PWA plugin
- Tailwind CSS plugin is referenced by the Vite config and stylesheet

## Run locally

```bash
npm install
npm run dev
```

Use the local URL printed by Vite.

Build and preview:

```bash
npm run build
npm run preview
```

Lint:

```bash
npm run lint
```

> **Dependency note:** The current committed `package.json` does not declare the Tailwind packages imported by `vite.config.js` and `src/index.css`. A clean install/build may therefore require dependency manifest updates before it works as expected.

## Application routes

| Route | Purpose |
|---|---|
| `/` | Browse the predefined categories |
| `/category/:categoryId` | View the selected category's items |

Category and item labels are local static data in `src/data/categories.js`. The current pictograms are Unicode emoji rather than a dedicated image collection.

## Project structure

```text
src/
  components/   Shared category and status UI
  data/         Category and item content
  pages/        Home and category pages
  App.jsx       Route definitions
  main.jsx      React entry point
public/         PWA icons and static assets
vite.config.js  Vite and PWA configuration
```

## Documentation

- [Technical project documentation](./PROJECT_DOCUMENTATION.md) — describes the enhanced local workspace and its architecture.

The technical documentation describes work in the local workspace that has not yet been synchronized to GitHub `main`. Treat the current source branch as authoritative for implemented behavior.

## Next steps

- Connect each item to its own Persian speech output.
- Decide whether to ship the local Piper-based TTS implementation and validate its dependencies.
- Add browser-level tests for routes, speech interaction, and offline behavior.
- Capture genuine screenshots after the application behavior is complete.
