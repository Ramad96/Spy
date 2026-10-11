export const CATEGORY_IDS = ['food', 'animals', 'places', 'jobs', 'sports', 'movies'] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

/** Built-in categories plus the player's own words. */
export type WordCategory = CategoryId | 'custom';

/** Returns a number in [0, 1). Passed in so rules stay repeatable in tests. */
export type Random = () => number;

export interface Player {
  id: string;
  name: string;
}

export interface WordEntry {
  word: string;
  hint: string;
  category: WordCategory;
}

export interface Settings {
  players: Player[];
  spyCount: number;
  categories: CategoryId[];
  customWords: WordEntry[];
}

export interface Round {
  word: string;
  hint: string;
  category: WordCategory;
  spyIds: string[];
  firstPlayerId: string;
}

export type ProblemCode =
  | 'too-few-players'
  | 'blank-name'
  | 'duplicate-name'
  | 'too-few-spies'
  | 'too-many-spies'
  | 'no-words'
  | 'incomplete-custom-word';

export interface Problem {
  code: ProblemCode;
  message: string;
}
