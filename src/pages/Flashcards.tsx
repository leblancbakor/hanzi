import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmptyState, PracticeShell } from "../components/Layout";
import { useShowPinyin } from "../lib/prefs";
import { actions, useStore } from "../lib/store";
import { catchUpQueue, practiceQueue, STATE_LABEL, stateOf, type Rating } from "../lib/srs";
import { cardFontSize, plural } from "../lib/utils";

export function Flashcards() {
  const [run, setRun] = useState(0);
  return <Session key={run} onAgain={() => setRun((n) => n + 1)} />;
}

function Session({ onAgain }: { onAgain: () => void }) {
  const { words } = useStore();
  const showPinyin = useShowPinyin();
  const [params] = useSearchParams();
  const catchup = params.get("mode") === "catchup";
  const category = params.get("category");

  // Fix the queue when the session starts so ratings do not reshuffle it.
  const [queue] = useState<string[]>(() => {
    const pool = category ? words.filter((w) => w.category === category) : words;
    return (catchup ? catchUpQueue(pool) : practiceQueue(pool)).map((w) => w.id);
  });
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<Rating[]>([]);

  const title = catchup ? "Catch-up quiz" : category ? `Flashcards: ${category}` : "Flashcards";
  const finished = index >= queue.length;
  const current = finished ? undefined : words.find((w) => w.id === queue[index]);

  const rate = useCallback(
    (rating: Rating) => {
      const id = queue[index];
      if (!id) return;
      actions.rate(id, rating);
      actions.logSession();
      setResults((r) => [...r, rating]);
      setRevealed(false);
      setIndex((i) => i + 1);
    },
    [queue, index],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.closest("button, a, input, select, textarea") || e.metaKey || e.ctrlKey || e.altKey)) return;
      if (finished) return;
      if (!revealed && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed) {
        if (e.key === "1") rate("forgot");
        else if (e.key === "2") rate("shaky");
        else if (e.key === "3") rate("got");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, revealed, rate]);

  if (queue.length === 0) {
    return (
      <PracticeShell title={title}>
        <EmptyState
          title={catchup ? "Nothing has slipped" : "No words to practise"}
          body={
            catchup
              ? "Every word is still fresh. Run regular flashcards to keep it that way."
              : "Add a few words first, then come back."
          }
        >
          {catchup && (
            <Link to="/practice/flashcards" className="pill solid">
              Practise flashcards
            </Link>
          )}
          <Link to="/words/new" className="pill">
            Add a word
          </Link>
        </EmptyState>
      </PracticeShell>
    );
  }

  const count = (r: Rating) => results.filter((x) => x === r).length;

  if (finished) {
    return (
      <PracticeShell title={title}>
        <section className="flex max-w-xl flex-col items-start gap-5">
          <h2 className="m-0 text-[clamp(36px,5vw,52px)] leading-[1.05] font-normal tracking-[-0.03em]">
            {plural(queue.length, "card")} done
          </h2>
          <p className="m-0 text-xl">
            {count("got")} got it, {count("shaky")} shaky, {count("forgot")} forgot.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="pill solid big" onClick={onAgain}>
              Practise again
            </button>
            <Link to="/" className="pill big">
              Back to Today
            </Link>
          </div>
        </section>
      </PracticeShell>
    );
  }

  if (!current) return null;
  const state = stateOf(current);
  const upNext = queue
    .slice(index + 1, index + 4)
    .map((id) => words.find((w) => w.id === id))
    .filter((w): w is NonNullable<typeof w> => Boolean(w));

  return (
    <PracticeShell title={title}>
      <div className="flex flex-wrap items-start gap-x-12 gap-y-10">
        <section aria-label="Card" className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
          <div className="card on-coral">
            <div className="flex items-start justify-between gap-3 text-lg">
              <span>{current.category}</span>
              <span className="tabular-nums">
                ({index + 1} of {queue.length})
              </span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-5 py-4">
              <p className="hz text-center" lang="zh-Hans" style={{ fontSize: cardFontSize(current.hanzi) }}>
                {current.hanzi}
              </p>
              {showPinyin && (
                <p className="m-0 text-center text-[clamp(32px,5vw,52px)] leading-none tracking-[-0.03em]">{current.pinyin}</p>
              )}
              <div aria-live="polite" className="flex min-h-[132px] flex-col items-center gap-1.5 text-center">
                {revealed && (
                  <>
                    {!showPinyin && (
                      <p className="m-0 text-[clamp(40px,6vw,64px)] leading-none tracking-[-0.03em]">{current.pinyin}</p>
                    )}
                    <p className="m-0 text-[26px]">{current.meaning || "No meaning added"}</p>
                    <p className="mt-2 mb-0 rounded-full border-[1.5px] border-white px-4 py-1 text-base">
                      {STATE_LABEL[state]}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          {!revealed ? (
            <button type="button" className="pill solid big full" onClick={() => setRevealed(true)}>
              Show answer
            </button>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button type="button" className="pill big flex-[1_1_140px]" onClick={() => rate("forgot")}>
                Forgot
              </button>
              <button type="button" className="pill big flex-[1_1_140px]" onClick={() => rate("shaky")}>
                Shaky
              </button>
              <button type="button" className="pill solid big flex-[1_1_140px]" onClick={() => rate("got")}>
                Got it
              </button>
            </div>
          )}
          <p className="m-0 text-sm text-muted">
            Keys: space shows the answer, then 1 forgot, 2 shaky, 3 got it.
          </p>
        </section>

        <aside className="flex min-w-0 flex-[1_1_340px] flex-col gap-9">
          <section aria-labelledby="sess" className="flex flex-col">
            <h2 id="sess" className="m-0 pb-3.5 text-[22px] font-normal tracking-tight">
              This session
            </h2>
            <div className="border-t-[1.5px] border-ink">
              {(
                [
                  ["Got it", "got"],
                  ["Shaky", "shaky"],
                  ["Forgot", "forgot"],
                ] as const
              ).map(([label, r]) => (
                <div key={r} className="nx justify-between">
                  <span>{label}</span>
                  <span className="text-muted tabular-nums">
                    {count(r)} / {queue.length}
                  </span>
                  <span className="bar w-[120px]" role="img" aria-label={`${count(r)} of ${queue.length}`}>
                    <i style={{ width: `${(count(r) / queue.length) * 100}%` }} />
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="note" className="flex flex-col gap-4 rounded-[30px] border-[1.5px] border-ink p-[22px_26px]">
            <h2 id="note" className="m-0 text-sm font-medium tracking-[0.04em] uppercase">
              Your note
            </h2>
            <p className="m-0 text-xl leading-snug tracking-tight">
              {current.note || <span className="text-muted">No note for this word yet.</span>}
            </p>
            <Link to={`/words/${current.id}`} className="pill self-start">
              {current.note ? "Edit note" : "Add a note"}
            </Link>
          </section>

          {upNext.length > 0 && (
            <section aria-labelledby="up" className="flex flex-col">
              <h2 id="up" className="m-0 pb-3.5 text-[22px] font-normal tracking-tight">
                Up next
              </h2>
              <ul className="m-0 list-none border-t-[1.5px] border-ink p-0">
                {upNext.map((w) => (
                  <li key={w.id} className="nx">
                    <span className="flex w-16 flex-col gap-1">
                      <span className="hz text-[28px]" lang="zh-Hans">
                        {w.hanzi}
                      </span>
                      {showPinyin && <span className="text-sm">{w.pinyin}</span>}
                    </span>
                    <span>{w.category}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </PracticeShell>
  );
}
