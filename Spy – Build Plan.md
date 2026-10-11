# Spy – Build Plan

Oct 11, 2026 · @Ramiz

## Overview

Build in 7 phases. It's one phone passed around the room, so there is **no server and no accounts** — just a website.

### Recommended stack

| Part | Tool | Why |
| --- | --- | --- |
| Language | TypeScript | Catches mistakes early |
| Game logic | `src/core` (pure TS) | No UI code, easy to test and port to iOS later |
| UI | React + Vite | Fast to build, easy for AI agents |
| Saving settings | Browser localStorage | Players and custom words remembered next time |
| Tests | Vitest | Simple and fast |
| Hosting | Vercel or Netlify | Free, one click |

### Folder structure

```
spy/
  src/
    core/       # rules: word bank, pick word, assign spies
    screens/    # Setup, Reveal, Round
    components/ # buttons, scramble text, player list
    theme/      # colours, fonts, effects
  docs/RULES.md
  AGENTS.md
```

### Design direction: secret agent HQ

- **Colours:** near-black background, terminal green or amber text, one red for "SPY"
- **Fonts:** monospace for text (e.g. JetBrains Mono), stencil font for headings
- **Effects:** scanlines, typewriter text, letters scrambling like code being cracked
- **Words:** "Agents" not players, "Mission" not game, "Classified" stamps, "Access denied" for the spy

## Game rules (the spec)

Give this section to the agent as `docs/RULES.md`.

### Setup screen

- **Players:** list of names. Add with one tap (Enter adds the next), remove with one tap. Minimum 3.
- **Spies:** 1 by default. Maximum is players minus 2.
- **Categories:** tick boxes (e.g. Food, Animals, Places, Jobs, Sports, Movies). At least one on, or custom words only.
- **Custom words:** each entry is a **word + spy hint**. Can be added and deleted.
- **Start mission** button, disabled until the setup is valid.

### Reveal flow (one phone, passed around)

1. Screen shows "Pass to **\[name\]**". Only that player looks.
2. They tap the screen. The scrambled letters unscramble into the secret word.
3. If they are a spy, the letters glitch and fail, then show: "You are the spy. Your hint: **\[hint\]**".
4. They tap **Word secured**. The word scrambles again.
5. They tap **Next player** and pass the phone on.
6. After the last player: "All agents briefed. Mission begins."

### Round screen

- Shows who gives the first hint (random player, can be a spy)
- Optional: **Reveal spy** button (hold to confirm) for the end of the round
- **New mission** button: same players, new word

### Confirmed rules

- Every built-in word needs a spy hint too, so the word bank stores both.
- All spies get the same hint.
- The same word won't come up twice until the whole list has been used.
- Anyone can be picked to go first, including a spy.

## The phases

Do one phase at a time. Tick it off only when "Done when" is true.

### Phase 0 — Set up the project

- [ ] Create a React + Vite + TypeScript app
- [ ] Add Vitest, ESLint, Prettier
- [ ] Add `docs/RULES.md` and `AGENTS.md`

**Done when:** `npm run dev` shows a blank page and `npm test` runs.

> **Prompt:** Set up a React + Vite + TypeScript project with Vitest. Create the folders in the plan (src/core, src/screens, src/components, src/theme). Read docs/RULES.md and AGENTS.md before writing code.

### Phase 1 — Game logic in `core`

- [ ] Types: `Player`, `Settings`, `WordEntry { word, hint, category }`, `Round`
- [ ] Word bank: 6 categories × 30 words, each with a hint
- [ ] `validateSettings(settings)` → list of problems
- [ ] `startRound(settings, random)` → secret word, hint, spy list, first player
- [ ] Track used words so they don't repeat

**Done when:** tests prove spies are random, counts are right and the first player is picked at random from everyone.

> **Prompt:** In src/core, implement the rules from docs/RULES.md as pure functions. Pass randomness in as a function so tests are repeatable. Create a word bank file with 6 categories of 30 words, each with a short, vague spy hint. Write Vitest tests for every rule.

### Phase 2 — Setup screen

- [ ] Player list: type name + Enter to add, ✕ to remove, drag to reorder
- [ ] Spy counter with + and − buttons (limited by player count)
- [ ] Category tick boxes
- [ ] Custom words: word + hint fields, list with delete
- [ ] Save everything to localStorage
- [ ] **Start mission** button, disabled with a reason shown when setup is invalid

**Done when:** you can set up a 6-player game in under 30 seconds, and it's still there after a refresh.

> **Prompt:** Build the Setup screen in src/screens. Mobile-first. Make adding and removing players very fast. Use validateSettings from core to disable Start and show why. Save settings to localStorage, wrapped in try/catch.

### Phase 3 — Reveal flow

- [ ] "Pass to \[name\]" screen
- [ ] Scramble component: random letters that settle into the word on tap
- [ ] Spy version: letters glitch, "ACCESS DENIED", then the hint
- [ ] **Word secured** re-scrambles; **Next player** moves on
- [ ] Block going back so no one can peek at earlier players

**Done when:** you can pass the phone round 5 people and nobody sees anyone else's word.

> **Prompt:** Build the Reveal screen. Create a reusable Scramble component that animates random characters into the target word over about 1 second. For spies, show a glitch effect, then "You are the spy" and the hint. Prevent the browser back button from revealing earlier players.

### Phase 4 — Round screen

- [ ] "All agents briefed" message
- [ ] Who goes first
- [ ] Optional: hold-to-reveal spy button
- [ ] **New mission** (same players) and **Back to setup**

**Done when:** you can play 3 rounds in a row without going back to setup.

> **Prompt:** Build the Round screen. Show who goes first, a hold-to-confirm Reveal spy button, and buttons for New mission and Back to setup.

### Phase 5 — Secret agent styling

- [ ] Colours, fonts and spacing as theme tokens
- [ ] Scanlines and subtle flicker background
- [ ] Typewriter headings, "CLASSIFIED" stamp on the reveal
- [ ] Optional sounds: typing, beep, alarm for the spy
- [ ] Respect "reduce motion" settings

**Done when:** it feels like a spy terminal and is still easy to read.

> **Prompt:** Apply the secret agent design direction from the plan. Put all colours and fonts in src/theme as CSS variables. Add scanlines, typewriter text and a CLASSIFIED stamp. Turn off animations when prefers-reduced-motion is set. Keep text large and readable.

### Phase 6 — Go live

- [ ] Deploy to Vercel or Netlify
- [ ] Add as a home screen app (PWA icon, works offline)
- [ ] Test on iPhone and Android

**Done when:** friends can open a link and play with no internet.

> **Prompt:** Make the app an installable PWA that works offline, then deploy it to Vercel. List anything I need to click in the Vercel dashboard.

## Working with the AI agent

Put this in `AGENTS.md` so the agent follows it every time:

```
- Read docs/RULES.md before coding.
- All game rules go in src/core. No React or browser code there.
- core never calls Math.random() directly; randomness is passed in.
- Write tests for every rule change. Run them before finishing.
- Mobile-first. Big tap targets (at least 48px).
- Keep the secret agent theme in src/theme; screens use its tokens.
- Keep changes small. Explain what you changed in 3 bullets.
```

**Your habits:**

- One phase per chat. Start a fresh chat for each phase.
- Commit to git after every phase that works.
- Test on your phone from Phase 2 onwards.
