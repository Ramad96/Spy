import { pickOne, shuffle } from './random';
import type { Problem, Random, Round, Settings, WordEntry } from './types';
import { WORD_BANK } from './wordBank';

export const MIN_PLAYERS = 3;

/** Spies allowed for a player count: always at least two non-spies. */
export function maxSpies(playerCount: number): number {
  return Math.max(1, playerCount - 2);
}

export function validateSettings(settings: Settings): Problem[] {
  const problems: Problem[] = [];
  const names = settings.players.map((p) => p.name.trim());

  if (settings.players.length < MIN_PLAYERS) {
    problems.push({
      code: 'too-few-players',
      message: `Add at least ${MIN_PLAYERS} agents (${settings.players.length} so far)`,
    });
  }
  if (names.some((n) => n === '')) {
    problems.push({ code: 'blank-name', message: 'Every agent needs a name' });
  }
  const lower = names.filter((n) => n !== '').map((n) => n.toLowerCase());
  if (new Set(lower).size !== lower.length) {
    problems.push({ code: 'duplicate-name', message: 'Two agents have the same name' });
  }
  if (settings.spyCount < 1) {
    problems.push({ code: 'too-few-spies', message: 'There must be at least 1 spy' });
  }
  if (
    settings.players.length >= MIN_PLAYERS &&
    settings.spyCount > maxSpies(settings.players.length)
  ) {
    problems.push({
      code: 'too-many-spies',
      message: `Too many spies: at most ${maxSpies(settings.players.length)} for ${settings.players.length} agents`,
    });
  }
  if (settings.customWords.some((w) => w.word.trim() === '' || w.hint.trim() === '')) {
    problems.push({
      code: 'incomplete-custom-word',
      message: 'Every custom word needs a word and a hint',
    });
  }
  if (buildWordPool(settings).length === 0) {
    problems.push({ code: 'no-words', message: 'Pick a category or add a custom word' });
  }
  return problems;
}

/** Every word this setup can draw from: chosen categories plus complete custom words. */
export function buildWordPool(settings: Settings): WordEntry[] {
  const builtIn = settings.categories.flatMap((c) => WORD_BANK[c] ?? []);
  const custom = settings.customWords
    .filter((w) => w.word.trim() !== '' && w.hint.trim() !== '')
    .map((w) => ({ word: w.word.trim(), hint: w.hint.trim(), category: 'custom' as const }));
  return [...builtIn, ...custom];
}

/** Stable key for remembering which words have been played. */
export function wordKey(entry: WordEntry): string {
  return `${entry.category}:${entry.word.toLowerCase()}`;
}

export interface RoundResult {
  round: Round;
  /** Word keys used so far, including this round's word. Feed back into the next round. */
  usedWords: string[];
}

/**
 * Deals a new round: a word nobody has had yet, the spies and who speaks first.
 * Once every word in the pool has been used the list starts over,
 * but never repeats the word that was just played if there's another choice.
 */
export function startRound(
  settings: Settings,
  random: Random,
  usedWords: readonly string[] = [],
): RoundResult {
  const problems = validateSettings(settings);
  if (problems.length > 0) {
    throw new Error(`Invalid settings: ${problems.map((p) => p.message).join('; ')}`);
  }

  const pool = buildWordPool(settings);
  const used = new Set(usedWords);
  let available = pool.filter((w) => !used.has(wordKey(w)));
  let nextUsed = [...usedWords];

  if (available.length === 0) {
    const last = usedWords[usedWords.length - 1];
    available = pool.length > 1 ? pool.filter((w) => wordKey(w) !== last) : pool;
    nextUsed = [];
  }

  const entry = pickOne(random, available);
  nextUsed.push(wordKey(entry));

  const spyIds = shuffle(random, settings.players)
    .slice(0, settings.spyCount)
    .map((p) => p.id);
  const firstPlayerId = pickOne(random, settings.players).id;

  return {
    round: { word: entry.word, hint: entry.hint, category: entry.category, spyIds, firstPlayerId },
    usedWords: nextUsed,
  };
}
