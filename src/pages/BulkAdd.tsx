import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BackIcon } from "../components/Layout";
import { actions, useStore } from "../lib/store";
import { pinyinFor, plural } from "../lib/utils";

const NEW = "__new__";
const HANZI = /[㐀-鿿]/;

type Row = { hanzi: string; pinyin: string; meaning: string };

/** Strip tone marks, spaces and case so "nǐ hǎo" and "ni3hao" compare equal-ish. */
function plain(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[\s\d']/g, "").toLowerCase();
}

/**
 * One word per line. Accepted shapes:
 *   你好                      (pinyin fills in)
 *   你好, nǐ hǎo, hello       (comma, tab or | separated)
 *   你好 nǐ hǎo hello         (spaces)
 *   你好 hello                (pinyin fills in, rest is the meaning)
 */
export function parseLines(text: string): Row[] {
  const rows: Row[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(/[,，\t|]/).map((p) => p.trim());
    let hanzi: string, pinyin = "", meaning = "";
    if (parts.length > 1) {
      const first = parts[0];
      // "不客气 bú kèqi, you're welcome": the hanzi field also carries its pinyin.
      const sp = first.match(/^(\S+)\s+(.+)$/);
      if (sp) {
        hanzi = sp[1];
        pinyin = sp[2];
        meaning = parts.slice(1).join(", ");
      } else {
        hanzi = first;
        // Two fields: the second is the pinyin only if it matches, otherwise a meaning.
        if (parts.length === 2 && plain(parts[1]) !== plain(pinyinFor(hanzi))) {
          meaning = parts[1];
        } else {
          pinyin = parts[1];
          meaning = parts.slice(2).join(", ");
        }
      }
    } else {
      const m = line.match(/^(\S+)\s*(.*)$/)!;
      hanzi = m[1];
      const rest = m[2];
      const target = plain(pinyinFor(hanzi));
      meaning = rest;
      if (target && rest) {
        const tokens = rest.split(/\s+/);
        for (let n = tokens.length; n >= 1; n--) {
          if (plain(tokens.slice(0, n).join("")) === target) {
            pinyin = tokens.slice(0, n).join(" ");
            meaning = tokens.slice(n).join(" ");
            break;
          }
        }
      }
    }
    rows.push({ hanzi, pinyin: pinyin || pinyinFor(hanzi), meaning });
  }
  return rows;
}

export function BulkAdd() {
  const { categories, words } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [text, setText] = useState("");
  const [choice, setChoice] = useState(params.get("category") ?? categories[0] ?? NEW);
  const [newCat, setNewCat] = useState("");
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");

  const rows = useMemo(() => parseLines(text), [text]);
  const existing = useMemo(() => new Set(words.map((w) => w.hanzi)), [words]);
  const seen = new Set<string>();
  const info = rows.map((r, i) => {
    const bad = !HANZI.test(r.hanzi) ? "No hanzi" : !r.pinyin ? "No pinyin" : "";
    const dup = existing.has(r.hanzi) ? "Already in deck" : seen.has(r.hanzi) ? "Repeated" : "";
    seen.add(r.hanzi);
    return { bad, dup, off: skipped.has(i) };
  });
  const ready = rows.filter((_, i) => !info[i].bad && !info[i].dup && !info[i].off);
  const category = choice === NEW ? newCat.trim() : choice;

  function toggle(i: number) {
    setSkipped((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  }

  function add() {
    if (!category) return setError("Pick a category or name a new one.");
    if (ready.length === 0) return setError("Nothing to add yet.");
    for (const r of ready) actions.addWord({ ...r, category, note: "" });
    navigate(`/words?category=${encodeURIComponent(category)}`);
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Link to="/words" className="round" aria-label="Back to Words">
          <BackIcon />
        </Link>
        <h1 className="m-0 text-lg font-normal">Add many words</h1>
      </div>

      <div className="flex flex-wrap items-start gap-x-14 gap-y-10">
        <div className="flex max-w-[760px] min-w-0 flex-[1_1_480px] flex-col gap-7">
          <div className="field">
            <label htmlFor="bulk-text">Words, one per line</label>
            <textarea
              id="bulk-text"
              rows={9}
              lang="zh-Hans"
              spellCheck={false}
              placeholder={"你好, nǐ hǎo, hello\n谢谢 thank you\n再见"}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setSkipped(new Set());
                setError("");
              }}
            />
            <span className="hint">
              Just the hanzi works. Add pinyin and a meaning after it, separated by commas or spaces. Missing pinyin is filled in.
            </span>
          </div>

          <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
            <legend className="mb-3 text-base font-medium">Put them in</legend>
            <div className="chips">
              {categories.map((c) => (
                <label key={c} className="chip">
                  <input type="radio" name="bulk-cat" checked={choice === c} onChange={() => setChoice(c)} />
                  <span>{c}</span>
                </label>
              ))}
              <label className="chip">
                <input type="radio" name="bulk-cat" checked={choice === NEW} onChange={() => setChoice(NEW)} />
                <span>+ New category</span>
              </label>
            </div>
            {choice === NEW && (
              <div className="field max-w-sm">
                <label htmlFor="bulk-newcat">New category name</label>
                <input id="bulk-newcat" type="text" autoComplete="off" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
              </div>
            )}
          </fieldset>

          {error && (
            <p role="alert" className="error m-0">
              {error}
            </p>
          )}
          <button type="button" className="pill solid big self-start" onClick={add} disabled={ready.length === 0}>
            {ready.length === 0 ? "Add words" : `Add ${plural(ready.length, "word")}${category ? ` to ${category}` : ""}`}
          </button>
        </div>

        <aside aria-label="Preview" className="flex max-w-[560px] min-w-0 flex-[1_1_340px] flex-col gap-4">
          <h2 className="m-0 text-[22px] font-normal tracking-tight">Preview</h2>
          {rows.length === 0 ? (
            <p className="m-0 text-muted">Your words show up here as you type.</p>
          ) : (
            <ul className="m-0 list-none border-t-[1.5px] border-ink p-0">
              {rows.map((r, i) => {
                const { bad, dup, off } = info[i];
                const note = bad || dup;
                return (
                  <li key={i} className="nx justify-between gap-3" style={{ opacity: off || note ? 0.55 : 1 }}>
                    <span className="hz w-24 shrink-0 text-[28px]" lang="zh-Hans">
                      {r.hanzi}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span>{r.pinyin || "…"}</span>
                      <span className="text-sm text-muted">{note || r.meaning || "No meaning"}</span>
                    </span>
                    {!note && (
                      <button type="button" className="pill" aria-pressed={off} onClick={() => toggle(i)}>
                        {off ? "Skipped" : "Skip"}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </>
  );
}
