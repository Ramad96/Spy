# Spy – Game Rules (spec)

One phone is passed around the room. There is no server and no accounts.

## Setup screen

- **Players:** list of names. Add with one tap (Enter adds the next), remove with one tap. Minimum 3.
- **Spies:** 1 by default. Maximum is players minus 2.
- **Categories:** tick boxes (Food, Animals, Places, Jobs, Sports, Movies). At least one on, or custom words only.
- **Custom words:** each entry is a **word + spy hint**. Can be added and deleted.
- **Start mission** button, disabled until the setup is valid.

## Reveal flow (one phone, passed around)

1. Screen shows "Pass to **[name]**". Only that player looks.
2. They tap the screen. The scrambled letters unscramble into the secret word.
3. If they are a spy, the letters glitch and fail, then show: "You are the spy. Your hint: **[hint]**".
4. They tap **Word secured**. The word scrambles again.
5. They tap **Next player** and pass the phone on.
6. After the last player: "All agents briefed. Mission begins."

## Round screen

- Shows who gives the first hint (random player, can be a spy).
- Optional: **Reveal spy** button (hold to confirm) for the end of the round.
- **New mission** button: same players, new word.

## Confirmed rules

- Every built-in word needs a spy hint too, so the word bank stores both.
- All spies get the same hint.
- The same word won't come up twice until the whole list has been used.
- Anyone can be picked to go first, including a spy.
