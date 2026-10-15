import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Today } from "./pages/Today";
import { Words } from "./pages/Words";
import { BulkAdd } from "./pages/BulkAdd";
import { WordEdit } from "./pages/WordEdit";
import { Categories } from "./pages/Categories";
import { Practice } from "./pages/Practice";
import { Flashcards } from "./pages/Flashcards";
import { Matching } from "./pages/Matching";
import { TypeIt } from "./pages/TypeIt";
import { Writing } from "./pages/Writing";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Today />} />
          <Route path="words" element={<Words />} />
          <Route path="words/bulk" element={<BulkAdd />} />
          <Route path="words/:id" element={<WordEdit />} />
          <Route path="categories" element={<Categories />} />
          <Route path="practice" element={<Practice />} />
          <Route path="*" element={<Today />} />
        </Route>
        <Route path="practice/flashcards" element={<Flashcards />} />
        <Route path="practice/matching" element={<Matching />} />
        <Route path="practice/type" element={<TypeIt />} />
        <Route path="practice/writing" element={<Writing />} />
      </Routes>
    </BrowserRouter>
  );
}
