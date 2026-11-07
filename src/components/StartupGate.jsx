import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const STARTUP_SKELETON_MS = 550;
const SKELETON_ITEMS = Array.from({ length: 8 }, (_, index) => index);

function StartupGate({ children }) {
  const [ready, setReady] = useState(false);
  const { pathname } = useLocation();
  const isCategoryPage = pathname.startsWith("/category/");

  useEffect(() => {
    document.getElementById("startup-screen")?.remove();
    const timer = window.setTimeout(
      () => setReady(true),
      STARTUP_SKELETON_MS,
    );

    return () => window.clearTimeout(timer);
  }, []);

  if (ready) {
    return children;
  }

  return (
    <main
      className="container mx-auto p-5"
      dir="rtl"
      aria-label="در حال بارگذاری تپ تو تاک"
      aria-busy="true"
    >
      {isCategoryPage ? (
        <div className="mb-10 flex items-center gap-4">
          <div className="startup-skeleton h-11 w-11 rounded-xl" />
          <div className="startup-skeleton h-8 w-40 rounded-lg" />
        </div>
      ) : (
        <div className="mb-10 flex justify-center">
          <div className="startup-skeleton h-20 w-20 rounded-full" />
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-white p-3">
        <div className="startup-skeleton h-5 w-36 rounded-md" />
        <div className="startup-skeleton h-9 w-44 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {SKELETON_ITEMS.map((item) => (
          <div
            key={item}
            className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-2xl bg-gray-100 p-8"
          >
            <div className="startup-skeleton h-14 w-14 rounded-full" />
            <div className="startup-skeleton h-5 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </main>
  );
}

export default StartupGate;
