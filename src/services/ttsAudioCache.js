const DATABASE_NAME = "tap-to-talk-audio";
const STORE_NAME = "generated-audio";
const MAX_CACHE_ENTRIES = 100;
const MAX_CACHE_BYTES = 50 * 1024 * 1024;
const VOICE_ID = "fa_IR-amir-medium";

let databasePromise;

function openDatabase() {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, 1);

      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE_NAME, { keyPath: "key" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("Audio cache is blocked."));
    }).catch((error) => {
      databasePromise = undefined;
      throw error;
    });
  }

  return databasePromise;
}

function reportCacheError(operation, error) {
  console.warn(`Could not ${operation} the local TTS audio cache.`, error);
}

function cacheKey(text) {
  return `${VOICE_ID}:${text}`;
}

export async function getCachedAudio(text) {
  try {
    if (!("indexedDB" in globalThis)) {
      throw new Error("IndexedDB is unavailable in this browser.");
    }

    const database = await openDatabase();
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(cacheKey(text));

    const record = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.onabort = () => reject(transaction.error);
    });

    if (record) {
      record.lastUsedAt = Date.now();
      store.put(record);
    }

    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });

    return record?.audio ?? null;
  } catch (error) {
    reportCacheError("read", error);
    return null;
  }
}

export async function cacheGeneratedAudio(text, audio) {
  try {
    if (!("indexedDB" in globalThis)) {
      throw new Error("IndexedDB is unavailable in this browser.");
    }

    const database = await openDatabase();
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    store.put({
      key: cacheKey(text),
      audio,
      size: audio.size,
      lastUsedAt: Date.now(),
    });

    request.onsuccess = () => {
      const records = request.result
        .filter((record) => record.key !== cacheKey(text))
        .sort((first, second) => first.lastUsedAt - second.lastUsedAt);
      let entryCount = records.length + 1;
      let totalBytes =
        audio.size + records.reduce((total, record) => total + record.size, 0);

      for (const record of records) {
        if (
          entryCount <= MAX_CACHE_ENTRIES &&
          totalBytes <= MAX_CACHE_BYTES
        ) {
          break;
        }

        store.delete(record.key);
        entryCount -= 1;
        totalBytes -= record.size;
      }
    };

    request.onerror = () => transaction.abort();

    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } catch (error) {
    reportCacheError("write", error);
  }
}
