import { categories } from "../data/categories";
import CategoryCard from "../components/categoryCard";

function HomePage() {
  return (
    <div className="container mx-auto p-5">
      <div className="flex items-center justify-center mb-10 p-6 bg-blue-500 text-white rounded-full w-20 h-20 mx-auto text-3xl">
        🎙️
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}

export default HomePage;
