import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { actions, useStore, type Word } from "../lib/store";
import { pinyinFor } from "../lib/utils";

type Props = {
  /** Existing word to edit; omit to add a new one. */
  word?: Word;
  /** Compact layout for the Today sidebar. */
  compact?: boolean;
  /** Category preselected for a new word. */
  defaultCategory?: string;
  /** Called whenever the typed values change, for a live preview. */
  onValues?: (values: { hanzi: string; pinyin: string; meaning: string; category: string }) => void;
};

const NEW = "__new__";

export function WordForm({ word, compact = false, defaultCategory, onValues }: Props) {
  const { categories } = useStore();
  const navigate = useNavigate();
  const uid = useId();
  const hanziRef = useRef<HTMLInputElement>(null);

  const initialCategory = word?.category ?? defaultCategory ?? categories[0] ?? NEW;
  const [hanzi, setHanzi] = useState(word?.hanzi ?? "");
  const [pinyin, setPinyin] = useState(word?.pinyin ?? "");
  const [meaning, setMeaning] = useState(word?.meaning ?? "");
  const [note, setNote] = useState(word?.note ?? "");
  const [choice, setChoice] = useState(initialCategory);
  const [newCategory, setNewCategory] = useState("");
  const [errors, setErrors] = useState<{ hanzi?: string; pinyin?: string; category?: string }>({});
  const [saved, setSaved] = useState<string | null>(null);

  // A category created elsewhere should become the default once it exists.
  useEffect(() => {
    if (!word && choice === NEW && categories.length > 0 && !newCategory) setChoice(categories[0]);
  }, [categories, choice, newCategory, word]);

  const shownCategory = choice === NEW ? newCategory.trim() : choice;
  useEffect(() => {
    onValues?.({ hanzi, pinyin, meaning, category: shownCategory });
  }, [onValues, hanzi, pinyin, meaning, shownCategory]);

  function onHanzi(value: string) {
    setHanzi(value);
    setSaved(null);
    // Keep autofilling while the pinyin is empty or still the suggestion for the old hanzi.
    if (!pinyin.trim() || pinyin === pinyinFor(hanzi)) setPinyin(pinyinFor(value));
  }

  function reset() {
    setHanzi("");
    setPinyin("");
    setMeaning("");
    setNote("");
    setNewCategory("");
    setErrors({});
    hanziRef.current?.focus();
  }

  function submit(andAnother: boolean) {
    const category = choice === NEW ? newCategory.trim() : choice;
    const next: typeof errors = {};
    if (!hanzi.trim()) next.hanzi = "Add the hanzi.";
    if (!pinyin.trim()) next.pinyin = "Add the pinyin.";
    if (!category) next.category = "Pick a category or name a new one.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const input = { hanzi, pinyin, meaning, category, note };
    if (word) {
      actions.updateWord(word.id, input);
      navigate("/words");
      return;
    }
    const added = actions.addWord(input);
    if (andAnother) {
      reset();
      setChoice(added.category);
      setSaved(`${added.hanzi} added to ${added.category}.`);
    } else {
      navigate("/words");
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    submit(false);
  }

  const showNew = choice === NEW;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-7">
      <div className="field">
        <label htmlFor={`${uid}-hanzi`}>Hanzi</label>
        <input
          ref={hanziRef}
          id={`${uid}-hanzi`}
          type="text"
          lang="zh-Hans"
          autoComplete="off"
          value={hanzi}
          onChange={(e) => onHanzi(e.target.value)}
          onBlur={() => !pinyin.trim() && setPinyin(pinyinFor(hanzi))}
          aria-invalid={Boolean(errors.hanzi)}
          aria-describedby={`${uid}-hanzi-hint`}
          className={compact ? "font-hanzi" : "min-h-[88px]! px-8! font-hanzi text-[48px]!"}
        />
        <span id={`${uid}-hanzi-hint`} className={errors.hanzi ? "error" : "hint"}>
          {errors.hanzi ?? "Type or paste the word. The pinyin fills itself in."}
        </span>
      </div>

      <div className="flex flex-wrap gap-5">
        <div className="field flex-1 basis-[200px]">
          <label htmlFor={`${uid}-pinyin`}>Pinyin</label>
          <input
            id={`${uid}-pinyin`}
            type="text"
            autoComplete="off"
            value={pinyin}
            onChange={(e) => {
              setPinyin(e.target.value);
            }}
            aria-invalid={Boolean(errors.pinyin)}
            aria-describedby={`${uid}-pinyin-hint`}
          />
          <span id={`${uid}-pinyin-hint`} className={errors.pinyin ? "error" : "hint"}>
            {errors.pinyin ?? "Filled in from the hanzi. Edit if it is wrong."}
          </span>
        </div>
        <div className="field flex-1 basis-[200px]">
          <label htmlFor={`${uid}-meaning`}>Meaning</label>
          <input
            id={`${uid}-meaning`}
            type="text"
            autoComplete="off"
            placeholder="In your words"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
          />
        </div>
      </div>

      <fieldset className="field m-0 border-0 p-0">
        <legend>Category</legend>
        <div className="chips">
          {categories.map((c) => (
            <label key={c} className="chip">
              <input type="radio" name={`${uid}-cat`} checked={choice === c} onChange={() => setChoice(c)} />
              <span>{c}</span>
            </label>
          ))}
          <label className="chip">
            <input type="radio" name={`${uid}-cat`} checked={showNew} onChange={() => setChoice(NEW)} />
            <span>+ New category</span>
          </label>
        </div>
        {showNew && (
          <div className="field mt-2">
            <label htmlFor={`${uid}-newcat`}>New category name</label>
            <input
              id={`${uid}-newcat`}
              type="text"
              autoComplete="off"
              placeholder="For example, Numbers"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </div>
        )}
        {errors.category && <span className="error">{errors.category}</span>}
      </fieldset>

      {!compact && (
        <div className="field">
          <label htmlFor={`${uid}-note`}>Your note (optional)</label>
          <textarea
            id={`${uid}-note`}
            placeholder="A memory trick, or where you heard it"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      )}

      <div role="status" className="min-h-6 text-lg">
        {saved}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="pill solid big flex-1 basis-[180px]">
          {word ? "Save changes" : "Add to deck"}
        </button>
        {!word && !compact && (
          <button type="button" className="pill big flex-1 basis-[180px]" onClick={() => submit(true)}>
            Add and start another
          </button>
        )}
        {word && (
          <button
            type="button"
            className="pill big flex-1 basis-[180px]"
            onClick={() => {
              if (window.confirm(`Delete ${word.hanzi}? This cannot be undone.`)) {
                actions.removeWord(word.id);
                navigate("/words");
              }
            }}
          >
            Delete word
          </button>
        )}
      </div>
    </form>
  );
}

