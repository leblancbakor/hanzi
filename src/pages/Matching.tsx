import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, PracticeShell } from "../components/Layout";
import { actions, useStore, type Word } from "../lib/store";
import { useShowPinyin } from "../lib/prefs";
import { shuffle } from "../lib/srs";

type Round = { left: Word[]; right: Word[] };

function buildRound(words: Word[]): Round {
  const seenPinyin = new Set<string>();
  const seenHanzi = new Set<string>();
  const picked: Word[] = [];
  for (const w of shuffle(words)) {
    const py = w.pinyin.trim().toLowerCase();
    if (seenPinyin.has(py) || seenHanzi.has(w.hanzi)) continue;
    seenPinyin.add(py);
    seenHanzi.add(w.hanzi);
    picked.push(w);
    if (picked.length === 6) break;
  }
  return { left: picked, right: shuffle(picked) };
}

export function Matching() {
  const [run, setRun] = useState(0);
  return <Round key={run} onAgain={() => setRun((n) => n + 1)} />;
}

function Round({ onAgain }: { onAgain: () => void }) {
  const { words } = useStore();
  const showPinyin = useShowPinyin();
  const [round] = useState<Round>(() => buildRound(words));
  const [selL, setSelL] = useState<string | null>(null);
  const [selR, setSelR] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [miss, setMiss] = useState<{ l: string; r: string } | null>(null);
  const [misses, setMisses] = useState(0);
  const [message, setMessage] = useState("Pick a hanzi, then its pinyin.");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const total = round.left.length;
  const complete = total > 0 && done.length === total;

  useEffect(() => {
    if (complete) actions.logSession();
  }, [complete]);

  if (total < 3) {
    return (
      <PracticeShell title="Matching">
        <EmptyState
          title="Not enough words yet"
          body="Matching needs at least 3 words with different pinyin. Add a few more and come back."
        >
          <Link to="/words/new" className="pill solid">
            Add a word
          </Link>
        </EmptyState>
      </PracticeShell>
    );
  }

  function choose(side: "L" | "R", id: string) {
    if (done.includes(id) || miss) return;
    const l = side === "L" ? id : selL;
    const r = side === "R" ? id : selR;
    if (l && r) {
      if (l === r) {
        const next = [...done, l];
        setDone(next);
        setSelL(null);
        setSelR(null);
        setMessage(next.length === total ? "All matched." : "Match.");
      } else {
        setMiss({ l, r });
        setMisses((n) => n + 1);
        setMessage("Not a pair. Try again.");
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
          setMiss(null);
          setSelL(null);
          setSelR(null);
        }, 600);
      }
      return;
    }
    if (side === "L") setSelL(id);
    else setSelR(id);
    setMessage(side === "L" ? "Now pick its pinyin." : "Now pick its hanzi.");
  }

  function cls(side: "L" | "R", id: string) {
    const sel = side === "L" ? selL === id : selR === id;
    const flash = miss && (side === "L" ? miss.l === id : miss.r === id);
    return `tile ${side === "L" ? "zh" : "py"}${done.includes(id) ? " done" : sel ? " sel" : ""}${flash ? " miss" : ""}`;
  }

  return (
    <PracticeShell title="Matching">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <h2 className="m-0 text-[clamp(30px,4vw,44px)] leading-[1.1] font-normal tracking-[-0.03em]">
          Pair each hanzi with its pinyin
        </h2>
        <div className="flex max-w-[280px] min-w-[220px] flex-[0_1_280px] flex-col gap-2">
          <span className="tabular-nums">
            {done.length} of {total} matched
          </span>
          <span className="bar" role="img" aria-label={`${done.length} of ${total} matched`}>
            <i style={{ width: `${(done.length / total) * 100}%` }} />
          </span>
        </div>
      </div>

      <p role="status" className="m-0 min-h-6 text-lg">
        {complete ? `All matched${misses ? ` with ${misses} ${misses === 1 ? "miss" : "misses"}` : " with no misses"}.` : message}
      </p>

      {complete ? (
        <div className="flex flex-wrap gap-3">
          <button type="button" className="pill solid big" onClick={onAgain}>
            Match again
          </button>
          <Link to="/" className="pill big">
            Back to Today
          </Link>
        </div>
      ) : (
        <div className="flex max-w-[880px] flex-wrap gap-x-16 gap-y-6">
          <ul aria-label="Hanzi" className="m-0 flex flex-[1_1_240px] list-none flex-col gap-3 p-0">
            {round.left.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  className={cls("L", w.id)}
                  lang="zh-Hans"
                  aria-pressed={selL === w.id}
                  aria-disabled={done.includes(w.id)}
                  onClick={() => choose("L", w.id)}
                >
                  <span className="flex flex-col items-center gap-1.5 py-3">
                    {w.hanzi}
                    {showPinyin && done.includes(w.id) && (
                      <span lang="en" className="font-sans text-lg tracking-[-0.02em]">
                        {w.pinyin}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <ul aria-label="Pinyin" className="m-0 flex flex-[1_1_240px] list-none flex-col gap-3 p-0">
            {round.right.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  className={cls("R", w.id)}
                  aria-pressed={selR === w.id}
                  aria-disabled={done.includes(w.id)}
                  onClick={() => choose("R", w.id)}
                >
                  {w.pinyin}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PracticeShell>
  );
}
