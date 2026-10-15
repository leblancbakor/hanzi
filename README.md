# 词卡 cíkǎ

A flashcard app for keeping the Chinese words you already know from dramas, songs and videos, and building on them.

Most courses start at lesson one. This one starts from what you already know: you add the words you've picked up, sort them into your own categories, and practise them at your level.

## What it does

- **Add words quickly**, one at a time or in bulk (one per line). Pinyin fills itself in from the hanzi.
- **Categories** you make yourself, like Numbers or Food.
- **Four ways to practise**
  - **Flashcards**: hanzi, pinyin and meaning, rated Forgot / Shaky / Got it.
  - **Matching**: pair each hanzi with its pinyin.
  - **Type it**: type the pinyin from the hanzi, or the hanzi from the meaning. Tone marks, tone numbers or no tones all work.
  - **Writing**: trace each character stroke by stroke, then write it from memory.
- **Spaced repetition**: words you forget come back sooner, and words you know come back less often.
- **Catch-up quiz** after time away, made from the words most likely to have slipped.
- **Pinyin toggle** on practice screens.
- **Export and import** your deck as JSON.

Everything is saved in your browser. There's no account and no server.

## Running it

```
npm install
npm run dev
```

`npm run build` makes a production build in `dist/`.

Writing practice loads stroke data from the internet, so it needs a connection.

## Built with

React, TypeScript, Vite, Tailwind CSS, [pinyin-pro](https://github.com/zh-lx/pinyin-pro) for pinyin and [Hanzi Writer](https://hanziwriter.org/) for stroke order.

## How it got here

- [DECISIONS.md](DECISIONS.md): what was decided and why.
- [PRODUCT.md](PRODUCT.md): who it's for and the principles behind it.

## Where this is going

This is the first piece of a bigger language app built on the same idea. Ideas that haven't been scheduled yet: adding sentences, sayings and idioms; generated next steps based on what you've added; tips for remembering; and more game-like practice.
