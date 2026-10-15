import type { ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { setShowPinyin, useShowPinyin } from "../lib/prefs";

const NAV = [
  { to: "/", zh: "今天", label: "Today", end: true },
  { to: "/words", zh: "词库", label: "Words", end: false },
  { to: "/categories", zh: "分类", label: "Categories", end: false },
  { to: "/practice", zh: "练习", label: "Practice", end: false },
];

export function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

export function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 11H4M10 5l-6 6 6 6" />
    </svg>
  );
}

export function Layout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1560px] flex-col gap-6 px-5 pt-6 pb-14 sm:px-10">
      <header className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <Link to="/" aria-label="词卡 cíkǎ, home" className="flex items-baseline gap-3 no-underline">
          <span className="font-hanzi text-[32px] leading-none font-medium">词卡</span>
          <span>cíkǎ</span>
        </Link>
        <nav aria-label="Main" className="flex flex-wrap gap-1">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="navlink">
              <span className="zh" lang="zh-Hans">{item.zh}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/words/new" className="pill solid">
          <PlusIcon />
          Add word
        </Link>
      </header>
      <hr className="rule" />
      <main id="main" className="flex flex-1 flex-col gap-6">
        <Outlet />
      </main>
    </div>
  );
}

/** Header for focused practice screens: back button, title, optional right slot. */
export function PracticeShell({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  const navigate = useNavigate();
  const showPinyin = useShowPinyin();
  return (
    <div className="mx-auto flex min-h-screen max-w-[1560px] flex-col gap-6 px-5 pt-6 pb-14 sm:px-10">
      <header className="flex items-center justify-between gap-4">
        <button type="button" className="round" aria-label="Back" onClick={() => navigate(-1)}>
          <BackIcon />
        </button>
        <h1 className="m-0 text-lg font-normal">{title}</h1>
        <div className="flex min-w-12 flex-wrap justify-end gap-2">
          {right}
          <button type="button" className="pill" aria-pressed={showPinyin} onClick={() => setShowPinyin(!showPinyin)}>
            Pinyin
          </button>
        </div>
      </header>
      <hr className="rule" />
      <main id="main" className="flex flex-1 flex-col gap-6">
        {children}
      </main>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <section className="flex max-w-xl flex-col items-start gap-4 rounded-[30px] border-[1.5px] border-ink p-8">
      <h2 className="m-0 text-[28px] leading-tight font-normal tracking-tight">{title}</h2>
      <p className="m-0 text-lg">{body}</p>
      <div className="flex flex-wrap gap-3">{children}</div>
    </section>
  );
}
