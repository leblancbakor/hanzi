import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { BackIcon } from "../components/Layout";
import { CardPreview } from "../components/CardPreview";
import { WordForm } from "../components/WordForm";
import { useStore } from "../lib/store";
import { plural } from "../lib/utils";

/** Add a new word (/words/new) or edit an existing one (/words/:id). */
export function WordEdit() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { words } = useStore();
  const word = id && id !== "new" ? words.find((w) => w.id === id) : undefined;
  const [values, setValues] = useState({ hanzi: "", pinyin: "", meaning: "", category: "" });
  const { categories } = useStore();

  if (id && id !== "new" && !word) {
    return (
      <>
        <h1 className="m-0 text-[28px] font-normal">That word is gone</h1>
        <p className="m-0 text-lg">It may have been deleted.</p>
        <Link to="/words" className="pill self-start">
          Back to Words
        </Link>
      </>
    );
  }

  const count = words.filter((w) => w.category === values.category).length;
  const known = categories.includes(values.category);

  return (
    <>
      <div className="flex items-center gap-4">
        <Link to="/words" className="round" aria-label="Back to Words">
          <BackIcon />
        </Link>
        <h1 className="m-0 text-lg font-normal">{word ? `Edit ${word.hanzi}` : "Add a word"}</h1>
      </div>
      <div className="flex flex-wrap items-start gap-x-14 gap-y-10">
        <div className="max-w-[760px] min-w-0 flex-[1_1_480px]">
          <WordForm key={word?.id ?? "new"} word={word} defaultCategory={params.get("category") ?? undefined} onValues={setValues} />
        </div>
        <aside aria-label="Preview" className="flex max-w-[520px] min-w-0 flex-[1_1_360px] flex-col gap-4">
          <h2 className="m-0 text-[22px] font-normal tracking-tight">How the card will look</h2>
          <CardPreview {...values} />
          {values.category && (
            <p className="m-0 text-sm text-muted">
              {known
                ? `${word ? "In" : "Goes into"} ${values.category}, which has ${plural(count, "word")}${word ? "" : " now"}.`
                : `${values.category} is a new category.`}
            </p>
          )}
        </aside>
      </div>
    </>
  );
}
