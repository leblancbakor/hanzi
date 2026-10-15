import { Link } from "react-router-dom";
import { EmptyState } from "../components/Layout";
import { WordForm } from "../components/WordForm";
import { actions, localDate, useStore } from "../lib/store";
import { catchUpQueue, stateOf } from "../lib/srs";
import { plural, sinceLabel, USER_NAME, weekDates } from "../lib/utils";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function Today() {
  const { words, categories, sessions, lastSession } = useStore();
  const shaky = words.filter((w) => stateOf(w) === "shaky").length;
  const catchUp = catchUpQueue(words);
  const week = weekDates();
  const today = localDate();
  const practised = week.filter((d) => sessions.includes(d)).length;
  const since = sinceLabel(lastSession);

  const stats = categories.map((name) => {
    const list = words.filter((w) => w.category === name);
    return {
      name,
      total: list.length,
      solid: list.filter((w) => stateOf(w) !== "shaky").length,
      shaky: list.filter((w) => stateOf(w) === "shaky").length,
    };
  });
  const lead = [...stats].sort((a, b) => b.total - a.total)[0];
  const leadWord = lead ? words.filter((w) => w.category === lead.name).reduce<(typeof words)[number] | undefined>((a, w) => (!a || w.hanzi.length > a.hanzi.length || (w.hanzi.length === a.hanzi.length && w.added >= a.added) ? w : a), undefined) : undefined;
  const others = stats.filter((s) => s !== lead);

  return (
    <div className="flex flex-wrap items-start gap-x-12 gap-y-10">
      <section aria-label="Welcome and deck" className="flex min-w-0 flex-[1_1_340px] flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 text-[clamp(40px,6vw,60px)] leading-[1.02] font-normal tracking-[-0.035em] text-balance">
            Hello, {USER_NAME}!
          </h1>
          <p className="m-0 text-lg">
            {words.length === 0
              ? "Add a few words you already know and we will start from there."
              : [since, shaky > 0 ? `${shaky} of your ${words.length} words are getting shaky.` : null]
                  .filter(Boolean)
                  .join(" ")}
          </p>
        </div>
        <hr className="rule" />
        <p className="m-0 text-lg">
          {practised === 0 ? "Nothing practised yet this week" : `${plural(practised, "day")} practised this week`}
        </p>
        <ol aria-label="This week" className="m-0 grid list-none grid-cols-7 gap-2 p-0">
          {week.map((date, i) => {
            const done = sessions.includes(date);
            const isToday = date === today;
            return (
              <li
                key={date}
                className={`day${isToday ? " today" : ""}${done ? " done" : ""}`}
                aria-label={`${DAY_NAMES[i]}${isToday ? ", today" : ""}${done ? ", practised" : ""}`}
              >
                {DAY_LETTERS[i]}
              </li>
            );
          })}
        </ol>
        <hr className="rule" />
        <div className="flex flex-col">
          <div className="flex items-baseline justify-between gap-3 pb-3.5">
            <h2 className="m-0 text-[22px] font-normal tracking-tight">Your deck</h2>
            <span className="text-sm text-muted">words solid or better</span>
          </div>
          {stats.length === 0 ? (
            <p className="m-0 border-t-[1.5px] border-ink pt-4 text-muted">No categories yet.</p>
          ) : (
            <div className="flex flex-col border-t-[1.5px] border-ink">
              {stats.map((s) => (
                <Link key={s.name} to={`/words?category=${encodeURIComponent(s.name)}`} className="row">
                  <span>{s.name}</span>
                  <span className="text-muted tabular-nums">
                    {s.solid} / {s.total}
                  </span>
                  <span className="bar" role="img" aria-label={`${s.solid} of ${s.total} solid or better`}>
                    <i style={{ width: `${s.total ? (s.solid / s.total) * 100 : 0}%` }} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="goals" className="flex min-w-0 flex-[1_1_380px] flex-col gap-6">
        <h2 id="goals" className="m-0 text-[44px] leading-[1.1] font-normal tracking-[-0.03em]">
          Today&apos;s goals
        </h2>
        {words.length === 0 ? (
          <EmptyState
            title="No words yet"
            body="Your goals appear once you have a few words. Start with the numbers 1 to 10, or add your own."
          >
            <button type="button" className="pill solid" onClick={() => actions.loadStarter()}>
              Load numbers 1 to 10
            </button>
            <Link to="/words/new" className="pill">
              Add a word
            </Link>
          </EmptyState>
        ) : (
          <>
            <div className="flex flex-col">
              <Link to="/practice/flashcards?mode=catchup" className="goal c" style={{ zIndex: 1, height: 104 }}>
                <span>Catch-up quiz</span>
                <span className="m">({plural(catchUp.length, "word")})</span>
              </Link>
              <Link to="/practice/flashcards" className="goal k" style={{ zIndex: 2, height: 104 }}>
                <span>Flashcards</span>
                <span className="m">({plural(Math.min(words.length, 10), "word")})</span>
              </Link>
              <Link to="/practice/matching" className="goal c" style={{ zIndex: 3, height: 104 }}>
                <span>Matching</span>
                <span className="m">({plural(Math.min(words.length, 6), "pair")})</span>
              </Link>
              <Link
                to="/practice/writing"
                className="goal k overflow-hidden"
                style={{ zIndex: 4, height: 330 }}
              >
                <span>Writing</span>
                <span className="m">({plural(Math.min(words.length, 5), "word")})</span>
                <span
                  aria-hidden="true"
                  className="absolute -bottom-[22px] left-[22px] text-[clamp(72px,9vw,128px)] leading-none tracking-[-0.05em] whitespace-nowrap text-sand"
                >
                  Writing
                </span>
              </Link>
            </div>
            <Link
              to={catchUp.length > 0 ? "/practice/flashcards?mode=catchup" : "/practice/flashcards"}
              className="pill big full"
            >
              {catchUp.length > 0 ? "Start catch-up quiz" : "Start flashcards"}
            </Link>
          </>
        )}
      </section>

      <section aria-labelledby="topics" className="flex min-w-0 flex-[1_1_340px] flex-col gap-4">
        <div className="flex min-h-11 items-center justify-between gap-3">
          <h2 id="topics" className="m-0 text-[22px] font-normal tracking-tight">
            Categories
          </h2>
          <Link to="/categories" className="pill !min-h-10">
            See all
          </Link>
        </div>
        {lead && (
          <Link
            to={`/words?category=${encodeURIComponent(lead.name)}`}
            className="on-coral relative block h-[300px] overflow-hidden rounded-[30px] bg-coral p-[22px_26px] text-white no-underline"
          >
            <span className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
              <span className="text-[38px] leading-[1.1] tracking-[-0.02em]">{lead.name}</span>
              <span className="pt-2.5 text-sm">({plural(lead.total, "word")})</span>
            </span>
            {leadWord && (
              <span
                aria-hidden="true"
                lang="zh-Hans"
                className="hz absolute -right-2 -bottom-8 text-[240px] text-transparent select-none"
                style={{ WebkitTextStroke: "2.5px #fff" }}
              >
                {[...leadWord.hanzi][0]}
              </span>
            )}
          </Link>
        )}
        {others.map((s) => (
          <Link key={s.name} to={`/words?category=${encodeURIComponent(s.name)}`} className="topic">
            <span>{s.name}</span>
            <span className="m">({plural(s.total, "word")})</span>
          </Link>
        ))}
        <div className="mt-3 flex flex-col gap-3.5">
          <h2 className="m-0 text-[22px] font-normal tracking-tight">Add a word</h2>
          <WordForm compact />
        </div>
      </section>
    </div>
  );
}
