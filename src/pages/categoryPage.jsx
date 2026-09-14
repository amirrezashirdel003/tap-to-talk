import { useParams, Link } from "react-router-dom";
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

  if (!category) {
    return (
      <div className="container mx-auto p-5" dir="rtl">
        <p>دسته‌ای پیدا نشد.</p>
        <Link to="/" className="text-blue-500 underline">
          بازگشت
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-5" dir="rtl">
      <div className="flex items-center gap-4 mb-10">
        <Link
          to="/"
          className="text-2xl bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center"
        >
          →
        </Link>
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
