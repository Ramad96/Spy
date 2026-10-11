import type { Random } from './types';

/** Integer in [0, max). */
export function randomInt(random: Random, max: number): number {
  return Math.min(max - 1, Math.floor(random() * max));
}

export function pickOne<T>(random: Random, items: readonly T[]): T {
  if (items.length === 0) throw new Error('Cannot pick from an empty list');
  return items[randomInt(random, items.length)];
}

/** Fisher–Yates shuffle; returns a new array. */
export function shuffle<T>(random: Random, items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(random, i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Small deterministic generator (mulberry32) for tests and replays. */
export function seededRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
