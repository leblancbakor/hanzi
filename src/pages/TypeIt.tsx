import { useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { pinyin as toPinyin } from "pinyin-pro";
import { EmptyState, PracticeShell } from "../components/Layout";
import { actions, useStore, type Word } from "../lib/store";
import { useShowPinyin } from "../lib/prefs";
import { practiceQueue, type Rating } from "../lib/srs";
import { cardFontSize, plural } from "../lib/utils";

type Dir = "pinyin" | "hanzi";
type Verdict = { rating: Rating; label: string; typed: string };

const squash = (s: string) => s.normalize("NFC").toLowerCase().replace(/v/g, "ü").replace(/[\s'’\-·]/g, "");
/** Strip tone marks and tone digits: "nǐ hǎo" and "ni3hao3" both become "nihao". */
const toneless = (s: string) =>
  squash(s).replace(/ü/g, "u").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\d/g, "");

function grade(word: Word, dir: Dir, typed: string): Verdict {
  const t = typed.trim();
  if (dir === "hanzi") {
    return t === word.hanzi
      ? { rating: "got", label: "Correct", typed: t }
      : { rating: "forgot", label: "Not quite", typed: t };
  }
  const num = toPinyin(word.hanzi, { toneType: "num", type: "array" }).join("");
  if (squash(t) === squash(word.pinyin) || squash(t) === squash(num)) return { rating: "got", label: "Correct", typed: t };
  if (toneless(t) === toneless(word.pinyin) && t)
    return { rating: "shaky", label: "Right sounds, check the tones", typed: t };
  return { rating: "forgot", label: "Not quite", typed: t };
}

export function TypeIt() {
  const [run, setRun] = useState(0);
  return <Session key={run} onAgain={() => setRun((n) => n + 1)} />;
}

function Session({ onAgain }: { onAgain: () => void }) {
  const { words } = useStore();
  const showPinyin = useShowPinyin();
  const [params] = useSearchParams();
  const category = params.get("category");
  const [queue] = useState<string[]>(() =>
    practiceQueue(category ? words.filter((w) => w.category === category) : words).map((w) => w.id),
  );
  const [dir, setDir] = useState<Dir>("pinyin");
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [results, setResults] = useState<Rating[]>([]);
  const input = useRef<HTMLInputElement>(null);

  const title = category ? `Type it: ${category}` : "Type it";
  const finished = index >= queue.length;
  const current = finished ? undefined : words.find((w) => w.id === queue[index]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!current) return;
    if (verdict) return next();
    const v = grade(current, dir, value);
    actions.rate(current.id, v.rating);
    actions.logSession();
    setResults((r) => [...r, v.rating]);
    setVerdict(v);
  }

  function skip() {
    if (!current || verdict) return;
    actions.rate(current.id, "forgot");
    actions.logSession();
    setResults((r) => [...r, "forgot"]);
    setVerdict({ rating: "forgot", label: "Skipped", typed: "" });
  }

  function next() {
    setVerdict(null);
    setValue("");
    setIndex((i) => i + 1);
    setTimeout(() => input.current?.focus(), 0);
  }

  if (queue.length === 0) {
    return (
      <PracticeShell title={title}>
        <EmptyState title="No words to practise" body="Add a few words first, then come back.">
          <Link to="/words/new" className="pill solid">
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
            {plural(queue.length, "word")} typed
          </h2>
          <p className="m-0 text-xl">
            {count("got")} correct, {count("shaky")} close, {count("forgot")} missed.
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
  const toHanzi = dir === "hanzi";

  return (
    <PracticeShell
      title={title}
      right={
        <div className="flex gap-2" role="group" aria-label="Direction">
          <button type="button" className="pill" aria-pressed={!toHanzi} disabled={Boolean(verdict)} onClick={() => setDir("pinyin")}>
            Hanzi → pinyin
          </button>
          <button type="button" className="pill" aria-pressed={toHanzi} disabled={Boolean(verdict)} onClick={() => setDir("hanzi")}>
            Meaning → hanzi
          </button>
        </div>
      }
    >
      <div className="flex flex-wrap items-start gap-x-10 gap-y-6">
        <div className="card on-coral min-w-0 flex-[1_1_420px]" style={{ maxWidth: 640 }}>
          <div className="flex items-start justify-between gap-3 text-lg">
            <span>{current.category}</span>
            <span className="tabular-nums">
              ({index + 1} of {queue.length})
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4 text-center">
            {toHanzi ? (
              <>
                <p className="m-0 text-[clamp(32px,6vw,56px)] leading-tight tracking-[-0.02em]">
                  {current.meaning || "No meaning added"}
                </p>
                <p className="m-0 text-2xl">{current.pinyin}</p>
              </>
            ) : (
              <>
                <p className="hz m-0" lang="zh-Hans" style={{ fontSize: cardFontSize(current.hanzi) }}>
                  {current.hanzi}
                </p>
                {showPinyin && verdict && (
                  <p className="m-0 text-[clamp(32px,5vw,52px)] leading-none tracking-[-0.03em]">{current.pinyin}</p>
                )}
              </>
            )}
          </div>
        </div>

        <form onSubmit={submit} className="flex min-w-0 flex-[1_1_320px] flex-col gap-4 self-center" style={{ maxWidth: 480 }}>
          <div className="field">
            <label htmlFor="answer">{toHanzi ? "Type the hanzi" : "Type the pinyin"}</label>
            <input
              ref={input}
              id="answer"
              type="text"
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              lang={toHanzi ? "zh-Hans" : "en"}
              readOnly={Boolean(verdict)}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={toHanzi ? "Use your Chinese keyboard" : "nǐ hǎo, or ni3 hao3, or ni hao"}
              className={toHanzi ? "font-hanzi" : undefined}
            />
            {!toHanzi && !verdict && <span className="hint">Tone marks are optional. Missing tones count as close.</span>}
          </div>

          <div role="status" aria-live="polite" className="min-h-[72px]">
            {verdict && (
              <div className="flex flex-col gap-1">
                <p className="m-0 text-2xl font-medium">{verdict.label}.</p>
                <p className="m-0 text-xl">
                  <span lang="zh-Hans" className="hz">
                    {current.hanzi}
                  </span>{" "}
                  {current.pinyin}
                  {current.meaning ? `, ${current.meaning}` : ""}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="pill solid big" disabled={!verdict && !value.trim()}>
              {verdict ? (index + 1 >= queue.length ? "Finish" : "Next") : "Check"}
            </button>
            {!verdict && (
              <button type="button" className="pill big" onClick={skip}>
                I don't know
              </button>
            )}
          </div>
        </form>
      </div>
    </PracticeShell>
  );
}
