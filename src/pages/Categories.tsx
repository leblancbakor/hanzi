import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/Layout";
import { actions, useStore } from "../lib/store";
import { plural } from "../lib/utils";
import { stateOf } from "../lib/srs";

export function Categories() {
  const { categories, words } = useStore();
  const [name, setName] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function add(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    actions.addCategory(name);
    setName("");
  }

  function saveRename(from: string) {
    actions.renameCategory(from, draft);
    setRenaming(null);
  }

  return (
    <>
      <h1 className="m-0 text-[clamp(40px,6vw,60px)] leading-[1.02] font-normal tracking-[-0.035em]">Categories</h1>

      <form onSubmit={add} className="flex max-w-xl flex-wrap items-end gap-3">
        <div className="field min-w-[200px] flex-[1_1_240px]">
          <label htmlFor="new-cat">New category</label>
          <input id="new-cat" type="text" autoComplete="off" placeholder="For example, Food and drink" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <button type="submit" className="pill solid big" disabled={!name.trim()}>
          Add category
        </button>
      </form>

      {categories.length === 0 ? (
        <EmptyState title="No categories yet" body="A category is a simple group of words, like Numbers or Family. They are also created when you add a word." />
      ) : (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-4 p-0">
          {categories.map((c) => {
            const list = words.filter((w) => w.category === c);
            const shaky = list.filter((w) => stateOf(w) === "shaky").length;
            return (
              <li key={c} className="flex flex-col gap-4 rounded-[30px] border-[1.5px] border-ink p-6">
                {renaming === c ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveRename(c);
                    }}
                    className="flex flex-col gap-3"
                  >
                    <div className="field">
                      <label htmlFor={`rename-${c}`}>Rename {c}</label>
                      <input id={`rename-${c}`} type="text" autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="pill solid">
                        Save
                      </button>
                      <button type="button" className="pill" onClick={() => setRenaming(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <Link to={`/words?category=${encodeURIComponent(c)}`} className="text-[28px] leading-tight tracking-tight no-underline">
                      {c}
                    </Link>
                    <p className="m-0 text-muted">
                      {plural(list.length, "word")}
                      {list.length > 0 ? `, ${shaky} shaky` : ""}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/words/new?category=${encodeURIComponent(c)}`} className="pill">
                        Add word
                      </Link>
                      <button
                        type="button"
                        className="pill"
                        onClick={() => {
                          setRenaming(c);
                          setDraft(c);
                        }}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        className="pill"
                        onClick={() => {
                          const msg =
                            list.length > 0
                              ? `Delete ${c} and its ${plural(list.length, "word")}? This cannot be undone.`
                              : `Delete ${c}?`;
                          if (window.confirm(msg)) actions.removeCategory(c);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
