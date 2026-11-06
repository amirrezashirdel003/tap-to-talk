import { useParams, useNavigate } from "react-router-dom";
import { categories } from "../data/categories";
import { usePersianTTS } from "../hooks/usePersianTTS";
import OfflineStatus from "../components/OfflineStatus";

function CategoryPage() {
  const { categoryId } = useParams();
  const category = categories.find((c) => c.id === categoryId);
  const navigate = useNavigate();
  const { playback, playItem, stop } = usePersianTTS();

  if (!category) {
    return (
      <div className="container mx-auto p-5" dir="rtl">
        <p>دسته‌ای پیدا نشد.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="border border-blue-200 bg-blue-100 rounded-xl cursor-pointer text-blue-900 bg-bgbox hover:bg-blue-100 text-[13.5px] font-semibold flex items-center gap-2.25 py-2.5 px-4"
        >
          بازگشت
        </button>
      </div>
    );
  }

  const activeItem = category.items.find(
    (item) => item.id === playback.activeItemId,
  );

  return (
    <div className="container mx-auto p-5" dir="rtl">
      <OfflineStatus />

      <div className="flex items-center gap-4 mb-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="border border-blue-200 bg-blue-100 rounded-xl cursor-pointer text-blue-900 bg-bgbox hover:bg-blue-100 text-[13.5px] font-semibold flex items-center gap-2.25 py-2.5 px-4"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </button>
        <h1 className="text-2xl font-bold">{category.title}</h1>
      </div>

      {playback.status !== "idle" && (
        <div
          aria-live="polite"
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-white p-3 text-sm"
        >
          <div className="flex flex-wrap items-center gap-3">
            {playback.status === "loading" && (
              <>
                <span className="animate-pulse text-blue-700">
                  در حال آماده‌سازی صدا...
                </span>
                {playback.progress > 0 && playback.progress < 100 && (
                  <span className="text-gray-600">{playback.progress}٪</span>
                )}
              </>
            )}
            {playback.status === "playing" && (
              <span className="text-green-700">
                در حال پخش: {activeItem?.title}
              </span>
            )}
            {playback.status === "paused" && (
              <span className="text-gray-700">پخش متوقف شده است.</span>
            )}
            {playback.status === "error" && (
              <span role="alert" className="text-red-700">
                {playback.error}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(playback.status === "playing" || playback.status === "paused") && (
              <button
                type="button"
                onClick={() => activeItem && playItem(activeItem)}
                className="rounded-lg border border-blue-200 px-3 py-1.5 text-blue-900"
              >
                {playback.status === "playing" ? "مکث" : "ادامه"}
              </button>
            )}
            <button
              type="button"
              onClick={stop}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-gray-700"
            >
              توقف
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {category.items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => playItem(item)}
            aria-pressed={
              playback.activeItemId === item.id &&
              (playback.status === "playing" || playback.status === "paused")
            }
            className={`flex flex-col items-center justify-center gap-2 p-8 rounded-2xl ${category.color} active:scale-95 transition-transform`}
          >
            <span className="text-6xl">{item.emoji}</span>
            <span className="text-lg font-bold">{item.title}</span>
            {playback.activeItemId === item.id &&
              playback.status === "loading" && (
                <span className="text-sm text-blue-800">در حال ساخت صدا...</span>
              )}
            {playback.activeItemId === item.id &&
              playback.status === "playing" && (
                <span className="animate-pulse text-sm text-green-800">
                  در حال پخش
                </span>
              )}
            {playback.activeItemId === item.id &&
              playback.status === "paused" && (
                <span className="text-sm text-gray-700">مکث شده</span>
              )}
            {playback.activeItemId === item.id &&
              playback.status === "error" && (
                <span className="text-sm text-red-700">خطا در ساخت صدا</span>
              )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryPage;
