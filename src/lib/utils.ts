import { pinyin } from "pinyin-pro";
import { DAY } from "./srs";

export const USER_NAME = "Edmilson";

export function pinyinFor(hanzi: string): string {
  const text = hanzi.trim();
  if (!text || !/[一-鿿]/.test(text)) return "";
  const syllables = pinyin(text, { toneType: "symbol", type: "array" });
  return syllables.join("");
}

/** Font size for a card's hanzi, shrinking as the word gets longer. */
export function cardFontSize(hanzi: string): string {
  const n = [...hanzi].length;
  const px = n <= 1 ? 300 : n === 2 ? 200 : n === 3 ? 140 : 100;
  const vw = n <= 1 ? 62 : n === 2 ? 42 : n === 3 ? 30 : 22;
  return `min(${px}px, ${vw}vw)`;
}

export function daysSince(ts: number, now = Date.now()): number {
  const start = (t: number) => new Date(new Date(t).setHours(0, 0, 0, 0)).getTime();
  return Math.round((start(now) - start(ts)) / DAY);
}

export function sinceLabel(ts: number | null): string | null {
  if (ts === null) return null;
  const d = daysSince(ts);
  if (d <= 0) return "Your last session was today.";
  if (d === 1) return "Your last session was yesterday.";
  return `Your last session was ${d} days ago.`;
}

/** Monday-first week containing `now`, as local YYYY-MM-DD strings. */
export function weekDates(now = new Date()): string[] {
  const monday = new Date(now);
  monday.setHours(12, 0, 0, 0);
  const offset = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - offset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  });
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}
