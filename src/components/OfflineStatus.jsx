import { useEffect, useState } from "react";
import {
  checkPersianOfflineReadiness,
  getPersianModelStatus,
  preparePersianModel,
  subscribeToPersianModelStatus,
} from "../services/persianTTS";

const MODEL_LABELS = {
  checking: "در حال بررسی آمادگی آفلاین...",
  "not-downloaded": "مدل گفتار هنوز دریافت نشده است.",
  downloading: "در حال دریافت مدل گفتار فارسی...",
  initializing: "در حال آماده‌سازی مدل گفتار...",
  cached: "مدل ذخیره شده؛ منابع آفلاین برنامه هنوز آماده نیستند.",
  ready: "مدل گفتار برای استفاده آفلاین آماده است.",
  error: "آماده‌سازی آفلاین گفتار ناموفق بود.",
};

function OfflineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [model, setModel] = useState(getPersianModelStatus());
  const [installPrompt, setInstallPrompt] = useState(null);
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToPersianModelStatus(setModel);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    const readinessCheck = window.setTimeout(
      () => void checkPersianOfflineReadiness(),
      0,
    );

    return () => {
      window.clearTimeout(readinessCheck);
      unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []);

  async function handlePrepareOffline() {
    setPreparing(true);
    try {
      await preparePersianModel((loaded, total) => {
        setModel({
          ...getPersianModelStatus(),
          state: "downloading",
          loaded,
          total,
        });
      });
    } catch {
      setModel(getPersianModelStatus());
    } finally {
      setPreparing(false);
    }
  }

  async function handleInstall() {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    setInstallPrompt(null);
  }

  return (
    <section
      aria-live="polite"
      className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-white p-3 text-sm"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className={online ? "text-green-700" : "text-red-700"}>
          {online ? "● آنلاین" : "● آفلاین"}
        </span>
        <span
          className={
            model.state === "ready" ? "text-green-700" : "text-gray-700"
          }
        >
          {MODEL_LABELS[model.state]}
        </span>
        {model.state === "downloading" && model.total > 0 && (
          <span className="text-gray-600">
            {Math.min(100, Math.round((model.loaded / model.total) * 100))}٪
          </span>
        )}
        {model.state === "error" && (
          <span role="alert" className="text-red-700">
            {model.error}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {model.state !== "ready" && (
          <button
            type="button"
            disabled={!online || preparing || model.state === "checking"}
            onClick={handlePrepareOffline}
            className="rounded-lg border border-blue-200 px-3 py-1.5 text-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {preparing ? "در حال آماده‌سازی..." : "آماده‌سازی استفاده آفلاین"}
          </button>
        )}
        {installPrompt && (
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-white"
          >
            نصب برنامه
          </button>
        )}
      </div>
    </section>
  );
}

export default OfflineStatus;
