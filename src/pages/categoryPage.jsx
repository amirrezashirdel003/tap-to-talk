import { useParams, Link, useNavigate } from "react-router-dom";
import { categories } from "../data/categories";

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  //   utterance.lang = "fa-IR";
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}

function CategoryPage() {
  const { categoryId } = useParams();
  const category = categories.find((c) => c.id === categoryId);
  const navigate = useNavigate();

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

  return (
    <div className="container mx-auto p-5" dir="rtl">
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {category.items.map((item) => (
          <button
            key={item.id}
            // onClick={() => speak(item.title)}
            onClick={() => speak("hello world")}
            className={`flex flex-col items-center justify-center gap-2 p-8 rounded-2xl ${category.color} active:scale-95 transition-transform`}
          >
            <span className="text-6xl">{item.emoji}</span>
            <span className="text-lg font-bold">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryPage;
