# Tap to Talk

Tap to Talk is a Persian-first visual communication web app. Users choose a category and a pictogram-labelled item to express everyday needs. The enhanced local workspace adds browser-based Persian text-to-speech and progressive offline support.

> **Branch status:** This draft describes the current local workspace. GitHub `main` is behind it: the committed category-page handler currently speaks the fixed English phrase “hello world” with `en-US`, rather than the selected item. Publish this README only together with the reviewed implementation that it documents.

## Features in the local workspace

- Eight predefined categories with 66 selectable items
- Emoji pictograms shown alongside Persian labels
- Persian text-to-speech using the Piper `fa_IR-amir-medium` voice
- In-browser model inference using ONNX Runtime Web and WebAssembly
- Persian text normalization and a small pronunciation dictionary
- Audio playback controls for play, pause, resume, and stop
- Generated WAV audio cached in IndexedDB
- PWA manifest, production Service Worker, and offline status display
- Separate model preparation flow for offline speech synthesis

Pictograms are Unicode emoji, not a dedicated image library. The available vocabulary is fixed in source; custom text entry and speech recognition are not implemented.

## Technology

- React 19 and JavaScript
- Vite
- React Router
- Tailwind CSS
- `@jtsage/piper-tts-web`
- `@diffusionstudio/piper-wasm`
- ONNX Runtime Web
- `vite-plugin-pwa` and Workbox
- Cache Storage and IndexedDB
- Oxlint

## Getting started

```bash
npm install
npm run dev
```

Create and preview a production build with:

```bash
npm run build
npm run preview
```

The PWA Service Worker is disabled in Vite development mode. Test installation and offline behavior with a production build served from HTTPS or `localhost`.

## Preparing offline speech

1. Open the production app online and choose **Prepare for offline use**.
2. Keep the app open until the voice model is downloaded and the interface reports that offline speech is ready.
3. Reload while still online so the Service Worker can activate and precache the application runtime.
4. Disconnect the network and verify that the app shell and speech synthesis work.

The voice model is downloaded on first preparation from its configured Hugging Face location. Its expected size is approximately 60.6 MiB. The model and voice configuration are stored in Cache Storage; generated WAV audio is stored separately in IndexedDB. Browser storage may be cleared or evicted, so offline availability is not permanent.

## Repository structure

```text
src/
  components/   Category and online/offline status UI
  data/         Categories and Persian pronunciation mappings
  hooks/        Speech playback state and controls
  pages/        Home and category pages
  services/     Piper inference and generated-audio cache
  assets/       Local Vazirmatn fonts and styles
public/         PWA icons and static branding assets
```

## Known limitations

- The GitHub `main` branch must be synchronized with the enhanced local code before this README is published.
- A clean install may fail because `vite.config.js` and `src/index.css` reference `@tailwindcss/vite` and `tailwindcss`, but those packages are not declared in the current local `package.json` or lockfile.
- Offline speech requires a successful initial model download, an active Service Worker, and sufficient browser storage.
- The pronunciation dictionary covers only a few explicit words; it is not a general Persian pronunciation engine.
- No screenshots, automated test suite, or GitHub Actions workflow were present during the repository audit.
- Check the upstream runtime, phonemizer, and voice-model terms before redistributing their assets.
