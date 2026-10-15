import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmptyState, PlusIcon } from "../components/Layout";
import { actions, useStore } from "../lib/store";
import { STATE_LABEL, stateOf } from "../lib/srs";
import { plural } from "../lib/utils";

type Sort = "shaky" | "newest" | "pinyin";

export function Words() {
  const { words, categories } = useStore();
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "";
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("shaky");
  const [importMsg, setImportMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const shown = words
    .filter((w) => !category || w.category === category)
    .filter(
      (w) =>
        !q ||
        w.hanzi.includes(query.trim()) ||
        w.pinyin.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q),
    )
    .sort((a, b) => {
      if (sort === "newest") return b.added - a.added;
      if (sort === "pinyin") return a.pinyin.localeCompare(b.pinyin);
      return a.box - b.box || a.added - b.added;
    });

  const shakyCount = words.filter((w) => stateOf(w) === "shaky").length;

  function pick(name: string) {
    const next = new URLSearchParams(params);
    if (name) next.set("category", name);
    else next.delete("category");
    setParams(next, { replace: true });
  }

  function download() {
    const blob = new Blob([actions.exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cika-words-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onImport(file: File | undefined) {
    if (!file) return;
    const ok = window.confirm("Importing replaces every word and category you have now. Continue?");
    if (!ok) return;
    const done = actions.importJson(await file.text());
    setImportMsg(done ? "Imported." : "That file is not a 词卡 export.");
    if (fileRef.current) fileRef.current.value = "";
  }

  if (words.length === 0) {
    return (
      <>
        <h1 className="m-0 text-[clamp(40px,6vw,60px)] leading-[1.02] font-normal tracking-[-0.035em]">Words</h1>
        <EmptyState
          title="Your deck is empty"
          body="Add the words you already know. Start with the numbers 1 to 10 if you like, then add your own."
        >
          <button type="button" className="pill solid" onClick={() => actions.loadStarter()}>
            Load numbers 1 to 10
          </button>
          <Link to="/words/new" className="pill">
            <PlusIcon />
            Add a word
          </Link>
          <Link to="/words/bulk" className="pill">
            Add many
          </Link>
          <button type="button" className="pill" onClick={() => fileRef.current?.click()}>
            Import a backup
          </button>
        </EmptyState>
        <input ref={fileRef} type="file" accept="application/json" className="sr-only" onChange={(e) => onImport(e.target.files?.[0])} aria-label="Import a backup file" />
        {importMsg && <p role="status" className="m-0">{importMsg}</p>}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <h1 className="m-0 text-[clamp(40px,6vw,60px)] leading-[1.02] font-normal tracking-[-0.035em]">Words</h1>
        <p className="m-0 text-lg">
          {plural(words.length, "word")}.{" "}
          {shakyCount > 0 ? `${shakyCount} ${shakyCount === 1 ? "is" : "are"} getting shaky.` : "None are shaky."}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          <button type="button" className="pill" aria-pressed={!category} onClick={() => pick("")}>
            All ({words.length})
          </button>
          {categories.map((c) => (
            <button key={c} type="button" className="pill" aria-pressed={category === c} onClick={() => pick(c)}>
              {c} ({words.filter((w) => w.category === c).length})
            </button>
          ))}
        </div>
        <div className="flex flex-[1_1_320px] flex-wrap items-center justify-end gap-3">
          <Link to="/words/bulk" className="pill">
            Add many
          </Link>
          <div className="field max-w-[340px] min-w-[200px] flex-[1_1_220px]">
            <label htmlFor="word-search" className="sr-only">
              Search words
            </label>
            <input
              id="word-search"
              type="search"
              placeholder="Search hanzi, pinyin, meaning"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="!min-h-11 !text-base"
            />
          </div>
          <div className="field">
            <label htmlFor="word-sort" className="sr-only">
              Sort words
            </label>
            <select
              id="word-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="!min-h-11 !text-base"
            >
              <option value="shaky">Shaky first</option>
              <option value="newest">Newest first</option>
              <option value="pinyin">Pinyin A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="m-0 text-lg">No words match. Try a different search or category.</p>
      ) : (
        <div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 pb-2.5 text-sm text-muted" aria-hidden="true">
            <span className="w-24">Hanzi</span>
            <span className="min-w-[110px] flex-[1_1_110px]">Pinyin</span>
            <span className="min-w-[170px] flex-[2_1_170px]">Meaning</span>
            <span className="min-w-[130px] flex-[1_1_130px]">Category</span>
            <span className="min-w-[92px]">State</span>
          </div>
          <ul className="m-0 list-none border-t-[1.5px] border-ink p-0">
            {shown.map((w) => {
              const state = stateOf(w);
              return (
                <li key={w.id}>
                  <Link to={`/words/${w.id}`} className="w" aria-label={`Edit ${w.hanzi}, ${w.pinyin}`}>
                    <span className="hz w-24 flex-none text-[32px] !leading-[1.1]" lang="zh-Hans">
                      {w.hanzi}
                    </span>
                    <span className="min-w-[110px] flex-[1_1_110px] text-xl">{w.pinyin}</span>
                    <span className="min-w-[170px] flex-[2_1_170px]">{w.meaning || <span className="text-muted">No meaning yet</span>}</span>
                    <span className="min-w-[130px] flex-[1_1_130px] text-sm text-muted">{w.category}</span>
                    <span className={`state ${state}`}>{STATE_LABEL[state]}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
        <span className="text-sm text-muted">
          Showing {shown.length} of {words.length}. Words are saved in this browser only.
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {importMsg && (
            <span role="status" className="text-sm">
              {importMsg}
            </span>
          )}
          <button type="button" className="pill" onClick={download}>
            Export backup
          </button>
          <button type="button" className="pill" onClick={() => fileRef.current?.click()}>
            Import backup
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="sr-only" onChange={(e) => onImport(e.target.files?.[0])} aria-label="Import a backup file" />
        </div>
      </div>
    </>
  );
}
