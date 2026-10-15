# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Tailwind + shadcn on Vite (user's choice). Chosen so 21st.dev components drop in directly. Storage is local to the browser for now; accounts and sync are a later decision.

## Users

One user to start: Edmilson, a returning learner of Mandarin. He has consumed Chinese media for three to four years and knows a scattered set of words by ear, but keeps forgetting them because he never uses them. He has dropped Duolingo and HelloChinese more than once: either the level was below him and taught nothing new, or above him and lost his attention.

He practises on desktop and on phone equally.

The longer-term audience is anyone resuming a language they are not new to, or have dropped before.

## Product Purpose

A flashcard site for keeping known Chinese words alive and growing them. The user adds words over time, sorts them into simple categories (numbers, for example), and practises them, including the characters themselves and matching characters to pinyin.

Success: words he already knows stop slipping away, and practice starts at his actual level instead of a course's level.

This site is the first piece of a larger language app built on the same idea.

## Positioning

The deck starts from what the learner already knows, not from lesson one. The learner declares knowledge (words, sentences, sayings, idioms) and the system builds outward from it: know 1 to 10, get tested past 10.

## Operating Context

- Words arrive from media: dramas, songs, video. They are heard first, read second.
- Adding happens in small moments, often mid-watch. Practice happens in separate sittings.
- After time away, the app opens with a quiz on what was learned in earlier sessions.

## Capabilities and Constraints

Confirmed for the flashcard site:

- Add words over time.
- Categorise words. Categories are simple, user-defined groups.
- Each word carries characters and pinyin.
- Practise characters.
- Match characters to pinyin.
- Simplified characters only.

Confirmed for the larger app, not yet scheduled:

- Add sentences, sayings and idioms to a personal "character" (profile of what the learner knows).
- Generated next-step material related to what was added.
- Tips and tricks for remembering.
- Gamification and media, so practice does not feel like a lecture.
- Welcome-back quiz after a period away.

Proposed by Claude and not yet confirmed by the user: spaced repetition scheduling, per-card confidence state, audio, tone drills, stroke-order writing, source tags, character breakdown, confusable pairs.

Terminology: "category" for a group of words; "character" in the user's brief means the learner's knowledge profile, which collides with "character" meaning hanzi. Unresolved; use "hanzi" or "characters" for the script and avoid the profile sense in UI copy until it is named.

Undecided: product name, accounts and sync, whether other languages follow Chinese.

## Evidence on Hand

No real deck exists yet. Any words, counts, streaks or statistics shown in designs are synthetic and must be labelled as sample data. No testimonials, user numbers or learning-outcome claims exist; none may be invented.

## Product Principles

1. Start from what the learner knows. Never make him prove beginner material again.
2. Adding a word must be quick enough to do mid-episode.
3. The deck is his: his words, his categories, his sources.
4. Practice should feel like play, not a lecture.
5. Coming back after a gap is the normal case, and the app should welcome it.
