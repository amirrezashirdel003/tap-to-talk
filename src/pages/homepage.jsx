import { categories } from "../data/categories";
import CategoryCard from "../components/categoryCard";
import OfflineStatus from "../components/OfflineStatus";

function HomePage() {
  return (
    <main className="container mx-auto p-5">
      <div className="flex items-center justify-center mb-10 p-6 bg-blue-500 text-white rounded-full w-20 h-20 mx-auto text-3xl">
        🎙️
      </div>

      <OfflineStatus />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </main>
  );
}

export default HomePage;
