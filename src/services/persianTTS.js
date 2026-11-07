const onnxWasmUrl = new URL(
  "../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm",
  import.meta.url,
).href;
const onnxMjsUrl = new URL(
  "../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.mjs",
  import.meta.url,
).href;
import piperDataUrl from "@diffusionstudio/piper-wasm/build/piper_phonemize.data?url";
import piperWasmUrl from "@diffusionstudio/piper-wasm/build/piper_phonemize.wasm?url";
import { getPersianSpeechText } from "../data/persianPronunciation";

const VOICE_ID = "fa_IR-amir-medium";
const MODEL_PATH = "fa/fa_IR/amir/medium/fa_IR-amir-medium.onnx";
const MODEL_HOST = "https://huggingface.co/";
const MODEL_PATH_PREFIX =
  "diffusionstudio/piper-voices/resolve/840e38a7e26d813bd6221b78cfbaefa3585b3f71";
const MODEL_URL = `${MODEL_HOST}${MODEL_PATH_PREFIX}/${MODEL_PATH}`;
const CONFIG_URL = `${MODEL_URL}.json`;
const MODEL_BYTES = 63531379;
const MODEL_CACHE_NAME = "tap-to-talk-persian-tts-v1";
const SPEECH_LENGTH_SCALE = 1.05;
const MAX_DOWNLOAD_ATTEMPTS = 3;
const MODEL_DOWNLOAD_TIMEOUT_MS = 180000;
const RUNTIME_ASSET_WAIT_MS = 60000;
const RUNTIME_ASSET_POLL_MS = 1000;
const RUNTIME_ASSETS_NOT_READY_MESSAGE =
  "مدل گفتار دریافت شد، اما فایل‌های آفلاین برنامه هنوز آماده نیستند. اتصال را برقرار نگه دارید، صفحه را تازه‌سازی کنید و دوباره آماده‌سازی را بزنید.";
const STORAGE_SPACE_ERROR_MESSAGE =
  "فضای ذخیره‌سازی کافی برای مدل گفتار آفلاین وجود ندارد. فضای دستگاه را آزاد کنید و دوباره تلاش کنید.";
const APP_RUNTIME_ASSETS = [
  onnxWasmUrl,
  onnxMjsUrl,
  piperDataUrl,
  piperWasmUrl,
];

const listeners = new Set();
const initialStatus = {
  state: "checking",
  loaded: 0,
  total: MODEL_BYTES,
  error: "",
};
let modelStatus = initialStatus;
let sessionPromise;
let phonemizerPromise;
let runtimeModulePromise;

function updateModelStatus(nextStatus) {
  modelStatus = { ...modelStatus, ...nextStatus };
  for (const listener of listeners) {
    listener(modelStatus);
  }
}

export function getPersianModelStatus() {
  return modelStatus;
}

export function subscribeToPersianModelStatus(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function openModelCache() {
  if (!("caches" in globalThis)) {
    throw new Error("This browser does not support persistent model storage.");
  }

  return caches.open(MODEL_CACHE_NAME);
}

async function readCachedModelFiles() {
  const cache = await openModelCache();
  const [modelResponse, configResponse] = await Promise.all([
    cache.match(MODEL_URL),
    cache.match(CONFIG_URL),
  ]);

  if (!modelResponse || !configResponse) {
    return null;
  }

  const model = await modelResponse.blob();
  const config = await configResponse.json();
  if (
    model.size !== MODEL_BYTES ||
    config.language?.code !== "fa_IR" ||
    !config.inference
  ) {
    await Promise.all([cache.delete(MODEL_URL), cache.delete(CONFIG_URL)]);
    return null;
  }

  return { cache, model, config };
}

async function downloadWithProgress(url, onProgress) {
  if (!navigator.onLine) {
    throw new Error(
      "مدل گفتار در این دستگاه ذخیره نشده است. هنگام اتصال اینترنت، ابتدا آماده‌سازی آفلاین را انجام دهید.",
    );
  }

  if (url === MODEL_URL && navigator.storage?.estimate) {
    let storageEstimate;
    try {
      storageEstimate = await navigator.storage.estimate();
    } catch (error) {
      console.warn("Could not estimate browser storage before model download.", error);
    }
    if (
      Number.isFinite(storageEstimate?.quota) &&
      Number.isFinite(storageEstimate?.usage) &&
      storageEstimate.quota - storageEstimate.usage <
        MODEL_BYTES + 5 * 1024 * 1024
    ) {
      throw new Error(STORAGE_SPACE_ERROR_MESSAGE);
    }
  }

  let lastError;
  for (let attempt = 1; attempt <= MAX_DOWNLOAD_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      MODEL_DOWNLOAD_TIMEOUT_MS,
    );
    try {
      const response = await fetch(url, {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Model download failed with HTTP ${response.status}.`);
      }

      const expectedLength =
        url === MODEL_URL
          ? MODEL_BYTES
          : Number(response.headers.get("content-length")) || 0;
      const reader = response.body?.getReader();
      const chunks = [];
      let loaded = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          chunks.push(value);
          loaded += value.byteLength;
          if (url === MODEL_URL) {
            onProgress(loaded, expectedLength || MODEL_BYTES);
          }
        }
      } else {
        const buffer = await response.arrayBuffer();
        chunks.push(new Uint8Array(buffer));
        loaded = buffer.byteLength;
        if (url === MODEL_URL) {
          onProgress(loaded, expectedLength || MODEL_BYTES);
        }
      }

      if (url === MODEL_URL && loaded !== MODEL_BYTES) {
        throw new Error(
          `The voice model download was incomplete (${loaded} of ${MODEL_BYTES} bytes).`,
        );
      }

      const blob = new Blob(chunks, {
        type: response.headers.get("content-type") || "application/octet-stream",
      });
      const cache = await openModelCache();
      await cache.put(
        url,
        new Response(blob, {
          headers: {
            "content-type": blob.type,
          },
        }),
      );
      return blob;
    } catch (error) {
      lastError =
        error?.name === "AbortError"
          ? new Error(
              "دریافت مدل بیش از حد طول کشید. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.",
            )
          : error;
      if (
        attempt < MAX_DOWNLOAD_ATTEMPTS &&
        navigator.onLine &&
        error?.name !== "QuotaExceededError"
      ) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * 2 ** (attempt - 1)),
        );
      } else {
        break;
      }
    } finally {
      window.clearTimeout(timeout);
    }
  }

  throw lastError;
}

async function loadModelFile(url, onProgress) {
  const cache = await openModelCache();
  const cachedResponse = await cache.match(url);
  if (cachedResponse) {
    const blob = await cachedResponse.blob();
    if (url !== MODEL_URL || blob.size === MODEL_BYTES) {
      return blob;
    }
    await cache.delete(url);
  }

  return downloadWithProgress(url, onProgress);
}

async function ensureSession(onProgress = () => {}) {
  if (!sessionPromise) {
    let runtime;
    sessionPromise = (async () => {
      runtimeModulePromise ??= import("@jtsage/piper-tts-web").catch((error) => {
        runtimeModulePromise = undefined;
        throw error;
      });
      runtime = await runtimeModulePromise;
      const { CachedFileReader, TtsSession } = runtime;
      const reader = new CachedFileReader({
        modelHost: MODEL_HOST,
        modelPathPrefix: MODEL_PATH_PREFIX,
        pathMap: { [VOICE_ID]: MODEL_PATH },
        useLocalCache: false,
        customLoader: async (url) => {
          updateModelStatus({
            state: "downloading",
            error: "",
            loaded: url === MODEL_URL ? 0 : modelStatus.loaded,
          });
          const blob = await loadModelFile(url, onProgress);

          if (url === CONFIG_URL) {
            const config = JSON.parse(await blob.text());
            config.inference.length_scale = SPEECH_LENGTH_SCALE;
            return new Blob([JSON.stringify(config)], {
              type: "application/json",
            });
          }

          return blob;
        },
      });

      updateModelStatus({ state: "initializing", error: "" });
      const session = await TtsSession.create({
        voiceId: VOICE_ID,
        fileReader: reader,
        fallbackStrategy: "local",
        wasmPaths: {
          onnxWasm: { wasm: onnxWasmUrl, mjs: onnxMjsUrl },
          piperData: piperDataUrl,
          piperWasm: piperWasmUrl,
        },
        logger: (message) => console.info(`[Persian TTS] ${message}`),
      });
      updateModelStatus({ state: "initializing", loaded: MODEL_BYTES });
      return session;
    })().catch((error) => {
      sessionPromise = undefined;
      if (runtime) {
        runtime.TtsSession._instance = null;
      }
      throw error;
    });
  }

  return sessionPromise;
}

async function ensurePhonemizer(session) {
  if (!phonemizerPromise) {
    phonemizerPromise = session.predict("سلام")
      .then(() => undefined)
      .catch((error) => {
        phonemizerPromise = undefined;
        throw error;
      });
  }

  return phonemizerPromise;
}

async function runtimeAssetsAreCached() {
  if (!("serviceWorker" in navigator) || !("caches" in globalThis)) {
    return false;
  }

  let registration;
  try {
    registration = await navigator.serviceWorker.getRegistration();
  } catch (error) {
    console.warn("Could not inspect the application service worker.", error);
    return false;
  }
  if (!registration?.active) {
    return false;
  }

  try {
    const cachedAssets = await Promise.all(
      APP_RUNTIME_ASSETS.map(async (assetUrl) =>
        Boolean(
          await caches.match(new URL(assetUrl, location.href).href, {
            ignoreSearch: true,
          }),
        ),
      ),
    );
    return cachedAssets.every(Boolean);
  } catch (error) {
    console.warn("Could not inspect cached application runtime assets.", error);
    return false;
  }
}

async function waitForRuntimeAssets() {
  if (!("serviceWorker" in navigator) || !("caches" in globalThis)) {
    return false;
  }

  const deadline = Date.now() + RUNTIME_ASSET_WAIT_MS;
  while (Date.now() < deadline) {
    if (await runtimeAssetsAreCached()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, RUNTIME_ASSET_POLL_MS));
  }
  return false;
}

export async function checkPersianOfflineReadiness() {
  try {
    const files = await readCachedModelFiles();
    if (!files) {
      updateModelStatus({
        state: "not-downloaded",
        loaded: 0,
        error: "",
      });
      return false;
    }

    const appAssetsReady = await runtimeAssetsAreCached();
    updateModelStatus({
      state: appAssetsReady ? "ready" : "cached",
      loaded: MODEL_BYTES,
      error: "",
    });
    return appAssetsReady;
  } catch (error) {
    console.error("Could not verify offline TTS readiness.", error);
    updateModelStatus({
      state: "error",
      error: "وضعیت ذخیره‌سازی آفلاین قابل بررسی نیست.",
    });
    return false;
  }
}

export async function preparePersianModel(onProgress = () => {}) {
  try {
    updateModelStatus({ state: "initializing", loaded: 0, error: "" });
    if (navigator.storage?.persist) {
      try {
        await navigator.storage.persist();
      } catch (error) {
        console.warn("Persistent storage could not be requested.", error);
      }
    }

    const session = await ensureSession(onProgress);
    updateModelStatus({ state: "initializing", loaded: MODEL_BYTES });
    await ensurePhonemizer(session);

    const offlineAssetsReady = await waitForRuntimeAssets();
    if (!offlineAssetsReady) {
      updateModelStatus({
        state: "cached",
        loaded: MODEL_BYTES,
        error: RUNTIME_ASSETS_NOT_READY_MESSAGE,
      });
      return false;
    }

    updateModelStatus({
      state: "ready",
      loaded: MODEL_BYTES,
      error: "",
    });
    return true;
  } catch (error) {
    console.error("Could not prepare Persian TTS for offline use.", error);
    let errorMessage =
      "آماده‌سازی گفتار آفلاین انجام نشد. اتصال اینترنت و فضای خالی دستگاه را بررسی و دوباره تلاش کنید.";
    if (error?.name === "QuotaExceededError") {
      errorMessage = STORAGE_SPACE_ERROR_MESSAGE;
    } else if (error instanceof Error && /[\u0600-\u06FF]/u.test(error.message)) {
      errorMessage = error.message;
    } else if (!navigator.onLine) {
      errorMessage =
        "اتصال اینترنت قطع شد. برای دریافت مدل، دوباره آنلاین شوید و آماده‌سازی را تکرار کنید.";
    }
    updateModelStatus({
      state: "error",
      error: errorMessage,
    });
    throw error;
  }
}

function splitLongText(text) {
  const sentences = text.split(/(?<=[.!?؟؛۔])\s+/u);
  const chunks = [];

  for (const sentence of sentences) {
    let remaining = sentence;

    while (remaining.length > 320) {
      let splitAt = remaining.lastIndexOf(" ", 320);
      if (splitAt < 160) {
        splitAt = 320;
      }
      chunks.push(remaining.slice(0, splitAt).trim());
      remaining = remaining.slice(splitAt).trim();
    }

    if (remaining) {
      chunks.push(remaining);
    }
  }

  return chunks;
}

function combineWavFiles(blobs) {
  if (blobs.length === 1) {
    return blobs[0];
  }

  return Promise.all(blobs.map((blob) => blob.arrayBuffer())).then((files) => {
    const firstView = new DataView(files[0]);
    const sampleRate = firstView.getUint32(24, true);
    const channels = firstView.getUint16(22, true);
    const bitDepth = firstView.getUint16(34, true);
    const audioData = files.map((file) => {
      const view = new DataView(file);
      if (
        view.byteLength < 44 ||
        view.getUint32(0, true) !== 0x46464952 ||
        view.getUint32(8, true) !== 0x45564157 ||
        view.getUint16(20, true) !== 1 ||
        view.getUint32(24, true) !== sampleRate ||
        view.getUint16(22, true) !== channels ||
        view.getUint16(34, true) !== bitDepth
      ) {
        throw new Error("Piper returned an unsupported WAV audio format.");
      }

      const dataLength = view.getUint32(40, true);
      if (dataLength > view.byteLength - 44) {
        throw new Error("Piper returned an incomplete WAV audio file.");
      }
      return new Uint8Array(file, 44, dataLength);
    });

    const dataLength = audioData.reduce((total, chunk) => total + chunk.length, 0);
    const wav = new Uint8Array(44 + dataLength);
    const header = new DataView(wav.buffer);
    wav.set(new Uint8Array(files[0], 0, 44));
    header.setUint32(4, wav.byteLength - 8, true);
    header.setUint32(40, dataLength, true);

    let offset = 44;
    for (const chunk of audioData) {
      wav.set(chunk, offset);
      offset += chunk.length;
    }

    return new Blob([wav], { type: "audio/wav" });
  });
}

export async function synthesizePersian(text, onProgress) {
  const speechText = getPersianSpeechText(text);
  if (!speechText) {
    throw new Error("Cannot synthesize empty text.");
  }

  const session = await ensureSession((loaded, total) =>
    onProgress?.({ loaded, total }),
  );
  await ensurePhonemizer(session);
  if (await runtimeAssetsAreCached()) {
    updateModelStatus({
      state: "ready",
      loaded: MODEL_BYTES,
      error: "",
    });
  }
  const audioChunks = [];

  for (const chunk of splitLongText(speechText)) {
    audioChunks.push(await session.predict(chunk));
  }

  return combineWavFiles(audioChunks);
}
