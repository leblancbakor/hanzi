import type { Word } from "./store";

export type Rating = "forgot" | "shaky" | "got";
export type WordState = "shaky" | "solid" | "mastered";

export const DAY = 86_400_000;
/** Days until a card is due again, indexed by Leitner box. */
const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];
export const MAX_BOX = INTERVAL_DAYS.length - 1;

export function stateOf(word: Pick<Word, "box">): WordState {
  if (word.box <= 1) return "shaky";
  if (word.box <= 3) return "solid";
  return "mastered";
}

export const STATE_LABEL: Record<WordState, string> = {
  shaky: "Shaky",
  solid: "Solid",
  mastered: "Mastered",
};

export function nextBox(box: number, rating: Rating): number {
  if (rating === "forgot") return 0;
  if (rating === "shaky") return Math.min(box, 1);
  return Math.min(MAX_BOX, box + 1);
}

export function dueAfter(box: number, now: number): number {
  return now + INTERVAL_DAYS[box] * DAY;
}

export function isDue(word: Word, now = Date.now()): boolean {
  return word.due <= now;
}

/** Words most likely to have slipped: shaky or overdue, most overdue first. */
export function catchUpQueue(words: Word[], limit = 8, now = Date.now()): Word[] {
  return words
    .filter((w) => stateOf(w) === "shaky" || isDue(w, now))
    .sort((a, b) => a.due - b.due)
    .slice(0, limit);
}

/** Due words first (most overdue first), then the rest by least recently due. */
export function practiceQueue(words: Word[], limit = 10, now = Date.now()): Word[] {
  const due = words.filter((w) => isDue(w, now)).sort((a, b) => a.due - b.due);
  const rest = words.filter((w) => !isDue(w, now)).sort((a, b) => a.due - b.due);
  return [...due, ...rest].slice(0, limit);
}

export function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
