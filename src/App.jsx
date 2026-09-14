import "./index.css";
import { Route, Routes } from "react-router-dom";
import Homepage from "./pages/homepage";
import CategoryPage from "./pages/categoryPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/category/:categoryId" element={<CategoryPage />} />
    </Routes>
  );
}

export default App;
