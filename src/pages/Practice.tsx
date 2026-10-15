import { Link } from "react-router-dom";
import { EmptyState } from "../components/Layout";
import { actions, useStore } from "../lib/store";
import { catchUpQueue } from "../lib/srs";
import { plural } from "../lib/utils";

const MODES = [
  { to: "/practice/flashcards", name: "Flashcards", blurb: "Hanzi, pinyin and meaning, one at a time" },
  { to: "/practice/matching", name: "Matching", blurb: "Pair each hanzi with its pinyin" },
  { to: "/practice/type", name: "Type it", blurb: "Type the pinyin or the hanzi from memory" },
  { to: "/practice/writing", name: "Writing", blurb: "Trace, then write from memory in the grid" },
];

export function Practice() {
  const { words, categories } = useStore();
  const catchUp = catchUpQueue(words);

  return (
    <>
      <h1 className="m-0 text-[clamp(40px,6vw,60px)] leading-[1.02] font-normal tracking-[-0.035em]">Practice</h1>
      {words.length === 0 ? (
        <EmptyState title="Nothing to practise yet" body="Add some words first, or load the numbers 1 to 10.">
          <button type="button" className="pill solid" onClick={() => actions.loadStarter()}>
            Load numbers 1 to 10
          </button>
          <Link to="/words/new" className="pill">
            Add a word
          </Link>
        </EmptyState>
      ) : (
        <div className="flex max-w-3xl flex-col gap-8">
          {catchUp.length > 0 && (
            <Link to="/practice/flashcards?mode=catchup" className="on-coral flex flex-wrap items-center justify-between gap-3 rounded-[30px] bg-coral p-6 text-xl text-white no-underline">
              <span>Catch-up quiz</span>
              <span className="text-base">({plural(catchUp.length, "word")})</span>
            </Link>
          )}
          <div>
            <h2 className="m-0 pb-3.5 text-[22px] font-normal tracking-tight">Modes</h2>
            <ul className="m-0 list-none border-t-[1.5px] border-ink p-0">
              {MODES.map((m) => (
                <li key={m.to}>
                  <Link to={m.to} className="flex min-h-14 items-center gap-3 border-b-[1.5px] border-ink py-3 no-underline hover:bg-ink/5">
                    <span className="flex flex-1 flex-col">
                      <span className="text-xl font-medium">{m.name}</span>
                      <span className="text-sm text-muted">{m.blurb}</span>
                    </span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M7.5 4.5 13 10l-5.5 5.5" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {categories.length > 1 && (
            <div>
              <h2 className="m-0 pb-3.5 text-[22px] font-normal tracking-tight">Practise one category</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link key={c} to={`/practice/flashcards?category=${encodeURIComponent(c)}`} className="pill">
                    {c}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
