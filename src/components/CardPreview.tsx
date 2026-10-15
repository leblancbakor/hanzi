import { cardFontSize } from "../lib/utils";

/** The coral card as it will appear in practice. */
export function CardPreview({
  hanzi,
  pinyin,
  meaning,
  category,
}: {
  hanzi: string;
  pinyin: string;
  meaning: string;
  category: string;
}) {
  return (
    <div className="card on-coral min-h-[400px]">
      <div className="flex justify-between gap-3 text-lg">
        <span>Flashcard</span>
        <span>{category}</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3.5 text-center">
        <p className="hz" lang="zh-Hans" style={{ fontSize: hanzi ? cardFontSize(hanzi) : "120px", opacity: hanzi ? 1 : 0.5 }}>
          {hanzi || "词"}
        </p>
        <p className="m-0 min-h-11 text-[44px] leading-none tracking-tight">{pinyin}</p>
        <p className="m-0 min-h-7 text-[22px]">{meaning}</p>
      </div>
    </div>
  );
}
