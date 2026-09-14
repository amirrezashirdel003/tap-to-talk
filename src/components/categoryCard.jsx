import { Link } from "react-router-dom";

function CategoryCard({ category }) {
  return (
    <Link
      to={`/category/${category.id}`}
      className={`flex flex-col items-center justify-center gap-2 p-8 rounded-2xl ${category.color} active:scale-95 transition-transform`}
    >
      <span className="text-6xl">{category.emoji}</span>
      <span className="text-lg font-bold">{category.title}</span>
    </Link>
  );
}

export default CategoryCard;
