import { useSyncExternalStore } from "react";

const KEY = "cika.showPinyin";

function load(): boolean {
  try {
    return localStorage.getItem(KEY) !== "0";
  } catch {
    return true;
  }
}

let showPinyin = load();
const listeners = new Set<() => void>();

/** Whether practice screens show pinyin under the hanzi. On by default. */
export function useShowPinyin(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => showPinyin,
  );
}

export function setShowPinyin(value: boolean) {
  showPinyin = value;
  try {
    localStorage.setItem(KEY, value ? "1" : "0");
  } catch {
    /* storage blocked: keep the choice in memory */
  }
  listeners.forEach((l) => l());
}
