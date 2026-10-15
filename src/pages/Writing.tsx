import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import HanziWriter from "hanzi-writer";
import { EmptyState, PracticeShell } from "../components/Layout";
import { actions, useStore } from "../lib/store";
import { useShowPinyin } from "../lib/prefs";
import { practiceQueue } from "../lib/srs";

const HANZI = /[㐀-鿿]/;

export function Writing() {
  const [run, setRun] = useState(0);
  return <Session key={run} onAgain={() => setRun((n) => n + 1)} />;
}

function Session({ onAgain }: { onAgain: () => void }) {
  const { words } = useStore();
  const showPinyin = useShowPinyin();
  const [queue] = useState(() => practiceQueue(words, 5).filter((w) => HANZI.test(w.hanzi)));
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [mode, setMode] = useState<"trace" | "memory">("trace");
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"writing" | "done" | "error">("writing");
  const [finished, setFinished] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const writer = useRef<HanziWriter | null>(null);

  const word = queue[wi];
  const chars = word ? [...word.hanzi].filter((c) => HANZI.test(c)) : [];
  const char = chars[ci];

  useEffect(() => {
    const el = host.current;
    if (!el || !char) return;
    el.innerHTML = "";
    setStatus("writing");
    const size = el.clientWidth || 320;
    const w = HanziWriter.create(el, char, {
      width: size,
      height: size,
      padding: 24,
      showOutline: mode === "trace",
      showCharacter: false,
      strokeColor: "#0F0F0F",
      outlineColor: "#d6cec6",
      highlightColor: "#CF3250",
      drawingColor: "#0F0F0F",
      showHintAfterMisses: 2,
      onLoadCharDataError: () => setStatus("error"),
    });
    writer.current = w;
    w.quiz({ onComplete: () => setStatus("done") });
    return () => {
      w.cancelQuiz();
      writer.current = null;
      el.innerHTML = "";
    };
  }, [char, mode, attempt, wi, ci]);

  function showOrder() {
    const w = writer.current;
    if (!w) return;
    w.cancelQuiz();
    w.animateCharacter({ onComplete: () => setAttempt((n) => n + 1) });
  }

  function next() {
    if (ci + 1 < chars.length) setCi(ci + 1);
    else if (wi + 1 < queue.length) {
      setWi(wi + 1);
      setCi(0);
    } else {
      actions.logSession();
      setFinished(true);
    }
  }

  if (queue.length === 0) {
    return (
      <PracticeShell title="Writing">
        <EmptyState title="No characters to write" body="Add a few words with Chinese characters first, then come back.">
          <Link to="/words/new" className="pill solid">
            Add a word
          </Link>
        </EmptyState>
      </PracticeShell>
    );
  }

  if (finished) {
    return (
      <PracticeShell title="Writing">
        <section className="flex max-w-xl flex-col items-start gap-5">
          <h2 className="m-0 text-[clamp(36px,5vw,52px)] leading-[1.05] font-normal tracking-[-0.03em]">Round done</h2>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="pill solid big" onClick={onAgain}>
              Write again
            </button>
            <Link to="/" className="pill big">
              Back to Today
            </Link>
          </div>
        </section>
      </PracticeShell>
    );
  }

  const isLast = wi + 1 >= queue.length && ci + 1 >= chars.length;

  return (
    <PracticeShell
      title="Writing"
      right={
        <div className="flex gap-2" role="group" aria-label="Mode">
          <button type="button" className="pill" aria-pressed={mode === "trace"} onClick={() => setMode("trace")}>
            Trace
          </button>
          <button type="button" className="pill" aria-pressed={mode === "memory"} onClick={() => setMode("memory")}>
            From memory
          </button>
        </div>
      }
    >
      <div className="flex flex-wrap items-start gap-x-12 gap-y-10">
        <section aria-label="Writing pad" className="flex min-w-0 flex-[1_1_360px] flex-col gap-5" style={{ maxWidth: 520 }}>
          <p className="m-0 text-lg tabular-nums">
            Character {ci + 1} of {chars.length}
            {queue.length > 1 ? `, word ${wi + 1} of ${queue.length}` : ""}
          </p>
          <div className="pad">
            <span className="d1" />
            <span className="d2" />
            <div ref={host} className="absolute inset-0 [&>svg]:absolute [&>svg]:inset-0" />
          </div>
          {status === "error" ? (
            <p role="alert" className="m-0 text-lg">
              Stroke data could not load. It comes from the internet, so check your connection.
            </p>
          ) : (
            <p role="status" className="m-0 min-h-6 text-lg">
              {status === "done" ? "Well written." : mode === "trace" ? "Trace each stroke in order." : "Write it from memory. A hint appears after two misses."}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {status === "error" ? (
              <button type="button" className="pill big" onClick={() => setAttempt((n) => n + 1)}>
                Retry
              </button>
            ) : (
              <>
                <button type="button" className="pill big" onClick={() => setAttempt((n) => n + 1)}>
                  Clear
                </button>
                <button type="button" className="pill big" onClick={showOrder}>
                  Show stroke order
                </button>
              </>
            )}
            <button type="button" className={`pill big${status === "done" ? " solid" : ""}`} onClick={next}>
              {status === "done" ? (isLast ? "Finish" : "Next") : "Skip"}
            </button>
          </div>
        </section>

        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="m-0 text-[64px] leading-none tracking-[-0.03em]">{word.pinyin}</p>
            <p className="m-0 text-2xl">{word.meaning || "No meaning added"}</p>
          </div>
          <section aria-labelledby="round" className="flex flex-col">
            <h2 id="round" className="m-0 pb-3.5 text-[22px] font-normal tracking-tight">
              This round
            </h2>
            <ul className="m-0 list-none border-t-[1.5px] border-ink p-0">
              {queue.map((w, i) => (
                <li key={w.id} className="nx justify-between">
                  <span className="flex w-24 flex-col gap-1">
                    <span className="hz text-[28px]" lang="zh-Hans">
                      {mode === "trace" || i < wi ? w.hanzi : "?"}
                    </span>
                    {showPinyin && <span className="text-sm">{w.pinyin}</span>}
                  </span>
                  <span>{w.meaning}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </PracticeShell>
  );
}
