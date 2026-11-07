import { useCallback, useEffect, useRef, useState } from "react";
import { cacheGeneratedAudio, getCachedAudio } from "../services/ttsAudioCache";
import {
  getPersianModelStatus,
  synthesizePersian,
} from "../services/persianTTS";

const INITIAL_PLAYBACK = {
  activeItemId: null,
  status: "idle",
  error: "",
  progress: 0,
};

function getPlaybackErrorMessage(error) {
  const modelReady = getPersianModelStatus().state === "ready";
  if (!navigator.onLine && !modelReady) {
    return "این دستگاه آفلاین است. اگر مدل گفتار قبلاً آماده نشده، برای دریافت و آماده‌سازی آن به اینترنت وصل شوید.";
  }
  if (!navigator.onLine) {
    return "پخش گفتار آفلاین انجام نشد. اتصال ذخیره‌سازی برنامه را بررسی کنید و در صورت ادامهٔ مشکل، هنگام اتصال اینترنت دوباره آماده‌سازی کنید.";
  }
  if (error?.name === "NotAllowedError") {
    return "مرورگر اجازهٔ پخش صدا را نداد. دوباره روی گزینه بزنید تا پخش آغاز شود.";
  }
  if (error?.name === "QuotaExceededError") {
    return "فضای ذخیره‌سازی دستگاه کافی نیست. مقداری فضا آزاد کنید و دوباره تلاش کنید.";
  }
  if (!modelReady) {
    return "مدل گفتار هنوز آماده نیست. اینترنت و فضای ذخیره‌سازی را بررسی و آماده‌سازی آفلاین را دوباره اجرا کنید.";
  }
  return "ساخت یا پخش گفتار ناموفق بود. دوباره تلاش کنید؛ اگر مشکل ادامه داشت، مدل گفتار را دوباره آماده کنید.";
}

function releaseAudio(audioRef, objectUrlRef) {
  const audio = audioRef.current;
  audioRef.current = null;

  if (audio) {
    audio.pause();
    audio.onended = null;
    audio.onerror = null;
    audio.removeAttribute("src");
    audio.load();
  }

  if (objectUrlRef.current) {
    URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }
}

export function usePersianTTS() {
  const [playback, setPlayback] = useState(INITIAL_PLAYBACK);
  const playbackRef = useRef(INITIAL_PLAYBACK);
  const requestIdRef = useRef(0);
  const generationQueueRef = useRef(Promise.resolve());
  const audioRef = useRef(null);
  const objectUrlRef = useRef(null);
  const mountedRef = useRef(true);

  const updatePlayback = useCallback((nextPlayback) => {
    playbackRef.current = nextPlayback;
    if (mountedRef.current) {
      setPlayback(nextPlayback);
    }
  }, []);

  const stop = useCallback(() => {
    requestIdRef.current += 1;
    releaseAudio(audioRef, objectUrlRef);
    updatePlayback(INITIAL_PLAYBACK);
  }, [updatePlayback]);

  const reportFailure = useCallback(
    (requestId, error) => {
      console.error("Persian text-to-speech failed.", error);
      if (requestId === requestIdRef.current) {
        releaseAudio(audioRef, objectUrlRef);
        updatePlayback({
          activeItemId: playbackRef.current.activeItemId,
          status: "error",
          error: getPlaybackErrorMessage(error),
          progress: 0,
        });
      }
    },
    [updatePlayback],
  );

  const playAudio = useCallback(
    async (audioBlob, itemId, requestId) => {
      if (requestId !== requestIdRef.current) {
        return;
      }

      releaseAudio(audioRef, objectUrlRef);
      const objectUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(objectUrl);
      audioRef.current = audio;
      objectUrlRef.current = objectUrl;

      audio.onended = () => {
        if (requestId === requestIdRef.current) {
          releaseAudio(audioRef, objectUrlRef);
          updatePlayback(INITIAL_PLAYBACK);
        }
      };
      audio.onerror = () => {
        reportFailure(requestId, new Error("The generated audio could not be played."));
      };

      await audio.play();
      if (requestId === requestIdRef.current) {
        updatePlayback({
          activeItemId: itemId,
          status: "playing",
          error: "",
          progress: 100,
        });
      }
    },
    [reportFailure, updatePlayback],
  );

  const playItem = useCallback(
    async (item) => {
      const current = playbackRef.current;

      if (current.activeItemId === item.id && current.status === "playing") {
        audioRef.current?.pause();
        updatePlayback({ ...current, status: "paused" });
        return;
      }

      if (current.activeItemId === item.id && current.status === "paused") {
        const requestId = requestIdRef.current;
        try {
          await audioRef.current?.play();
          if (requestId === requestIdRef.current) {
            updatePlayback({ ...playbackRef.current, status: "playing" });
          }
        } catch (error) {
          reportFailure(requestId, error);
        }
        return;
      }

      if (current.activeItemId === item.id && current.status === "loading") {
        stop();
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      releaseAudio(audioRef, objectUrlRef);
      updatePlayback({
        activeItemId: item.id,
        status: "loading",
        error: "",
        progress: 0,
      });

      try {
        const cachedAudio = await getCachedAudio(item.title);
        if (requestId !== requestIdRef.current) {
          return;
        }

        let audioBlob = cachedAudio;
        if (!audioBlob) {
          const generation = generationQueueRef.current.then(async () => {
            if (requestId !== requestIdRef.current) {
              return null;
            }

            const generatedAudio = await synthesizePersian(
              item.title,
              ({ loaded, total }) => {
                if (requestId === requestIdRef.current && total > 0) {
                  updatePlayback({
                    ...playbackRef.current,
                    progress: Math.min(100, Math.round((loaded / total) * 100)),
                  });
                }
              },
            );
            await cacheGeneratedAudio(item.title, generatedAudio);
            return generatedAudio;
          });

          generationQueueRef.current = generation.catch(() => null);
          audioBlob = await generation;
        }

        if (audioBlob && requestId === requestIdRef.current) {
          await playAudio(audioBlob, item.id, requestId);
        }
      } catch (error) {
        reportFailure(requestId, error);
      }
    },
    [playAudio, reportFailure, stop, updatePlayback],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
      releaseAudio(audioRef, objectUrlRef);
    };
  }, []);

  return { playback, playItem, stop };
}
