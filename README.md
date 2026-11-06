# Tap to Talk

Tap to Talk is a Persian-first visual communication app for people who may have difficulty speaking, including some older adults and people with speech difficulties. Users choose from everyday categories and tap a labelled item to hear its Persian text spoken aloud.

The app is an assistive communication project, not a medical device or a substitute for professional care. Its content is predefined and limited to the needs represented in the app.

## Features

- Persian, right-to-left interface with eight categories and 66 predefined items
- Emoji labels displayed with each category and item
- Responsive layout that adapts from two columns on narrow screens to four columns on wider screens
- Persian text-to-speech powered by Piper voice `fa_IR-amir-medium`
- Playback controls for pause, resume, and stop
- Progressive Web App manifest and service worker for installable app-shell resources
- Offline speech after the initial model and application resources have been prepared online
- IndexedDB caching for previously generated audio
- Online/offline and speech-model readiness indicators

## Persian speech and offline use

The first model download requires an internet connection and downloads approximately 61 MB from Hugging Face. To prepare offline speech:

1. Open the app over HTTPS (or `localhost`) in a supported browser while online.
2. Allow the app to finish loading and its service worker to cache the application resources.
3. Use **Prepare for offline use** and wait until the voice status says it is ready.
4. Test playback once with the network disconnected.

Once prepared, Piper, ONNX Runtime Web, and the phonemizer run in the browser; new speech can be generated without a network connection. Previously generated WAV audio is cached locally in IndexedDB. Browser storage may be cleared or evicted, and installation/offline support depends on the browser and device.

The install button is shown only in browsers that provide the PWA installation prompt. On other supported platforms, use the browser's own install/add-to-home-screen option when available. The service worker is disabled in the Vite development server; use a production build and preview or an HTTPS host to verify PWA behavior.

## Technology

- React, React DOM, JavaScript, and JSX
- Vite and React Router
- Tailwind CSS
- Piper TTS Web with the `fa_IR-amir-medium` voice
- ONNX Runtime Web and WebAssembly
- Piper phonemizer WebAssembly
- `vite-plugin-pwa` and Workbox
- Cache Storage for the voice model and app resources; IndexedDB for generated audio

Speech generation runs locally in the browser after the voice model has been downloaded. The initial model download is from Hugging Face; the project does not define an application server or a custom speech API.

## Getting started

Requirements: Node.js and npm versions compatible with the Vite version in `package.json`.

```bash
npm ci
npm run dev
```

Use the local URL printed by Vite.

Build and preview the production app:

```bash
npm run build
npm run preview
```

Run lint:

```bash
npm run lint
```

## Routes

| Route | Purpose |
|---|---|
| `/` | Browse the predefined categories |
| `/category/:categoryId` | Select an item and play its Persian speech |

Category and item data are local and static in `src/data/categories.js`. The visible pictograms are Unicode emoji, not a dedicated image library.

## Project structure

```text
src/
  components/   Shared category and online/offline UI
  data/         Categories, items, and Persian pronunciation adjustments
  hooks/        Text-to-speech playback state
  pages/        Home and category pages
  services/     Piper inference and generated-audio storage
  App.jsx       Route definitions
  main.jsx      React entry point
public/         PWA icons and static assets
vite.config.js  Vite, Tailwind, and PWA configuration
```

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) for the detailed Persian technical documentation, including architecture, PWA caching, TTS, offline preparation, and implementation limits.

## Current limitations

- The eight categories and 66 items are fixed in source; users cannot add custom messages.
- The pictograms are emoji and may look different across devices.
- Pronunciation preprocessing includes a small hand-maintained word list; it is not comprehensive.
- First-time offline setup requires internet, sufficient storage, and a compatible browser.
- PWA installation and persistent browser storage are platform-dependent.
- There are no automated browser tests for speech or offline behavior in the repository.
