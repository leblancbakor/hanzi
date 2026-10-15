# Decisions

The decisions behind this app and the reasons for them. Newest at the top.

The project went into git on 2026-10-15. Entries marked *(written after the fact)* describe choices made before then, reconstructed from the code and [PRODUCT.md](PRODUCT.md).

---

## 2026-10-15: Pinyin toggle on practice screens

**Problem:** On the practice screens I couldn't see the pinyin while looking at the hanzi, which made it harder to connect how a word looks with how it sounds.

**Decision:** Pinyin now shows under the hanzi. A **Pinyin** button on every practice screen turns it on or off, and the choice is remembered.

- Flashcards and Writing show it straight away.
- Matching and Type it show it only after you answer. There the pinyin *is* the answer, so showing it first would turn them into copying.

**Trade-off:** With pinyin on, flashcards test meaning rather than reading. The toggle lets me choose per session.

---

## Type it practice *(written after the fact)*

**Problem:** Flashcards and Matching only test whether I *recognise* a word. I can see 你好 and know it, but that doesn't mean I can produce it.

**Decision:** Add a mode where I type the answer. It works two ways: hanzi → pinyin, or meaning → hanzi.

**Details:**
- Pinyin answers accept `nǐ hǎo`, `ni3 hao3` or `ni hao`. Typing tone marks is awkward on most keyboards, so I didn't want that to block practice.
- Right sounds with wrong or missing tones counts as **close** ("check the tones"), not wrong. It's rated Shaky so the word comes back soon without being reset.
- "I don't know" counts as Forgot, so skipping is honest instead of guessing.

---

## Spaced repetition with Leitner boxes *(written after the fact)*

**Problem:** I kept forgetting words I already knew because I never used them.

**Decision:** Every word sits in a box from 0 to 5. Each box has a review interval: now, 1, 3, 7, 14 and 30 days.

- **Got it** moves the word up one box.
- **Shaky** drops it to box 1 at most.
- **Forgot** sends it back to box 0.

**Why this over something like SM-2 or Anki's algorithm:** It's simple enough to understand and to explain in the app (Shaky / Solid / Mastered). It also only needs one number per word. This was suggested during development, not part of my first brief, and I kept it.

---

## Catch-up quiz after time away *(written after the fact)*

**Problem:** Coming back after a gap is normal for me, and opening an app to a pile of overdue cards feels bad.

**Decision:** The Today page offers a short catch-up quiz of up to 8 words, made from words that are shaky or overdue, most overdue first. It also tells me when my last session was, without guilt-tripping.

---

## Data stays in the browser *(written after the fact)*

**Decision:** Words and progress are saved in the browser's localStorage. There's no backend and no account.

**Why:** It's a personal tool for one person to start with. It works immediately and costs nothing to run.

**Trade-off:** Data doesn't sync between my phone and computer, and clearing browser data deletes it. Export and import as JSON is the backup for now. Accounts and sync are an open decision.

---

## Adding words has to be fast *(written after the fact)*

**Problem:** I hear new words mid-episode. If adding one takes more than a few seconds, I won't do it.

**Decision:**
- Pinyin fills in automatically from the hanzi (via pinyin-pro), and I can still edit it.
- There's a bulk-add page that takes one word per line in loose formats like `你好`, `你好 hello` or `你好, nǐ hǎo, hello`.
- There's an add-word form right on the Today page.

---

## Writing practice with stroke order *(written after the fact)*

**Decision:** Use Hanzi Writer to trace a character's strokes, then write it from memory, with a hint after two misses.

**Why:** Recognising a character and being able to write it are different skills, and writing helps it stick.

**Trade-off:** Stroke data loads from the internet, so this mode doesn't work offline.

---

## Simplified characters only *(written after the fact)*

**Decision:** Support simplified characters only for now. It's what I'm learning, and supporting both would complicate pinyin lookup and stroke data.

---

## Starting from what I already know *(written after the fact)*

**Problem:** I'd dropped Duolingo and HelloChinese more than once. They were either below my level and taught me nothing, or above it and lost me.

**Decision:** The deck starts from words I already know instead of a fixed course. I add what I've picked up, and practice builds from there.

This is the core idea of the whole project. See [PRODUCT.md](PRODUCT.md).
