import { CATEGORY_IDS, type CategoryId, type Settings, type WordEntry } from '../core';

const SETTINGS_KEY = 'spy.settings.v1';
const USED_WORDS_KEY = 'spy.usedWords.v1';

export const DEFAULT_SETTINGS: Settings = {
  players: [],
  spyCount: 1,
  categories: [...CATEGORY_IDS],
  customWords: [],
};

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full, blocked or private mode: the game still works, it just won't remember.
  }
}

const isString = (v: unknown): v is string => typeof v === 'string';

/** Loads saved settings, dropping anything malformed rather than crashing. */
export function loadSettings(): Settings {
  const saved = read(SETTINGS_KEY);
  if (!saved || typeof saved !== 'object') return DEFAULT_SETTINGS;
  const s = saved as Record<string, unknown>;

  const players = Array.isArray(s.players)
    ? s.players.filter(
        (p): p is Settings['players'][number] =>
          !!p && typeof p === 'object' && isString(p.id) && isString(p.name),
      )
    : DEFAULT_SETTINGS.players;
  const categories = Array.isArray(s.categories)
    ? s.categories.filter((c): c is CategoryId => CATEGORY_IDS.includes(c as CategoryId))
    : DEFAULT_SETTINGS.categories;
  const customWords = Array.isArray(s.customWords)
    ? s.customWords
        .filter((w) => !!w && typeof w === 'object' && isString(w.word) && isString(w.hint))
        .map((w): WordEntry => ({ word: w.word, hint: w.hint, category: 'custom' }))
    : DEFAULT_SETTINGS.customWords;
  const spyCount =
    typeof s.spyCount === 'number' && Number.isFinite(s.spyCount)
      ? Math.max(1, Math.floor(s.spyCount))
      : DEFAULT_SETTINGS.spyCount;

  return { players, spyCount, categories, customWords };
}

export function saveSettings(settings: Settings): void {
  write(SETTINGS_KEY, settings);
}

export function loadUsedWords(): string[] {
  const saved = read(USED_WORDS_KEY);
  return Array.isArray(saved) ? saved.filter(isString) : [];
}

export function saveUsedWords(used: string[]): void {
  write(USED_WORDS_KEY, used);
}

let counter = 0;
export function newId(): string {
  counter += 1;
  return `${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 7)}`;
}
