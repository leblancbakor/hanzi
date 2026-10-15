import { useSyncExternalStore } from "react";
import { dueAfter, nextBox, type Rating } from "./srs";

export type Word = {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  category: string;
  note: string;
  /** Leitner box, 0 (new or forgotten) to 5. */
  box: number;
  /** Timestamp (ms) when the word is next due. */
  due: number;
  added: number;
};

export type State = {
  version: 1;
  words: Word[];
  /** Category names, in the order they were created. */
  categories: string[];
  /** Local dates (YYYY-MM-DD) with at least one practice session. */
  sessions: string[];
  /** Timestamp (ms) of the latest practice session. */
  lastSession: number | null;
};

export type WordInput = Pick<Word, "hanzi" | "pinyin" | "meaning" | "category" | "note">;

const KEY = "cika.v1";
const EMPTY: State = { version: 1, words: [], categories: [], sessions: [], lastSession: null };

function isState(value: unknown): value is State {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<State>;
  return (
    v.version === 1 &&
    Array.isArray(v.words) &&
    Array.isArray(v.categories) &&
    Array.isArray(v.sessions)
  );
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    return isState(parsed) ? { ...EMPTY, ...parsed } : EMPTY;
  } catch {
    return EMPTY;
  }
}

let state: State = load();
const listeners = new Set<() => void>();

function commit(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: keep working in memory */
  }
  listeners.forEach((l) => l());
}

export function useStore(): State {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}

export function localDate(ts = Date.now()): string {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function newId(): string {
  return crypto.randomUUID();
}

function withCategory(categories: string[], name: string): string[] {
  const clean = name.trim();
  if (!clean) return categories;
  return categories.some((c) => c.toLowerCase() === clean.toLowerCase())
    ? categories
    : [...categories, clean];
}

/** Resolve a typed category name to the stored spelling, if it exists. */
export function canonicalCategory(categories: string[], name: string): string {
  const clean = name.trim();
  return categories.find((c) => c.toLowerCase() === clean.toLowerCase()) ?? clean;
}

export const actions = {
  addWord(input: WordInput): Word {
    const now = Date.now();
    const category = canonicalCategory(state.categories, input.category);
    const word: Word = {
      ...input,
      hanzi: input.hanzi.trim(),
      pinyin: input.pinyin.trim(),
      meaning: input.meaning.trim(),
      category,
      note: input.note.trim(),
      id: newId(),
      box: 0,
      due: now,
      added: now,
    };
    commit({
      ...state,
      words: [...state.words, word],
      categories: withCategory(state.categories, category),
    });
    return word;
  },

  updateWord(id: string, input: WordInput) {
    const category = canonicalCategory(state.categories, input.category);
    commit({
      ...state,
      words: state.words.map((w) =>
        w.id === id
          ? {
              ...w,
              hanzi: input.hanzi.trim(),
              pinyin: input.pinyin.trim(),
              meaning: input.meaning.trim(),
              category,
              note: input.note.trim(),
            }
          : w,
      ),
      categories: withCategory(state.categories, category),
    });
  },

  removeWord(id: string) {
    commit({ ...state, words: state.words.filter((w) => w.id !== id) });
  },

  rate(id: string, rating: Rating) {
    const now = Date.now();
    commit({
      ...state,
      words: state.words.map((w) => {
        if (w.id !== id) return w;
        const box = nextBox(w.box, rating);
        return { ...w, box, due: dueAfter(box, now) };
      }),
    });
  },

  logSession() {
    const now = Date.now();
    const today = localDate(now);
    commit({
      ...state,
      sessions: state.sessions.includes(today) ? state.sessions : [...state.sessions, today],
      lastSession: now,
    });
  },

  addCategory(name: string) {
    commit({ ...state, categories: withCategory(state.categories, name) });
  },

  renameCategory(from: string, to: string) {
    const clean = to.trim();
    if (!clean || clean === from) return;
    if (state.categories.some((c) => c !== from && c.toLowerCase() === clean.toLowerCase())) return;
    commit({
      ...state,
      categories: state.categories.map((c) => (c === from ? clean : c)),
      words: state.words.map((w) => (w.category === from ? { ...w, category: clean } : w)),
    });
  },

  /** Removes the category and every word in it. */
  removeCategory(name: string) {
    commit({
      ...state,
      categories: state.categories.filter((c) => c !== name),
      words: state.words.filter((w) => w.category !== name),
    });
  },

  exportJson(): string {
    return JSON.stringify(state, null, 2);
  },

  /** Replaces everything with the imported data. Returns false if the file is not a valid export. */
  importJson(text: string): boolean {
    try {
      const parsed: unknown = JSON.parse(text);
      if (!isState(parsed)) return false;
      commit({ ...EMPTY, ...parsed });
      return true;
    } catch {
      return false;
    }
  },

  loadStarter() {
    const now = Date.now();
    const numbers: Array<[string, string, string]> = [
      ["一", "yī", "one"],
      ["二", "èr", "two"],
      ["三", "sān", "three"],
      ["四", "sì", "four"],
      ["五", "wǔ", "five"],
      ["六", "liù", "six"],
      ["七", "qī", "seven"],
      ["八", "bā", "eight"],
      ["九", "jiǔ", "nine"],
      ["十", "shí", "ten"],
    ];
    const existing = new Set(state.words.map((w) => w.hanzi));
    const added: Word[] = numbers
      .filter(([hanzi]) => !existing.has(hanzi))
      .map(([hanzi, pinyin, meaning]) => ({
        id: newId(),
        hanzi,
        pinyin,
        meaning,
        category: "Numbers",
        note: "",
        box: 0,
        due: now,
        added: now,
      }));
    commit({
      ...state,
      words: [...state.words, ...added],
      categories: withCategory(state.categories, "Numbers"),
    });
  },
};
