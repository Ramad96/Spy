import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CATEGORY_IDS,
  WORD_BANK,
  buildWordPool,
  maxSpies,
  seededRandom,
  shuffle,
  startRound,
  validateSettings,
  wordKey,
  type Player,
  type Settings,
} from './index';

function players(n: number): Player[] {
  return Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `Agent ${i}` }));
}

function settings(overrides: Partial<Settings> = {}): Settings {
  return {
    players: players(5),
    spyCount: 1,
    categories: ['food'],
    customWords: [],
    ...overrides,
  };
}

const codes = (s: Settings) => validateSettings(s).map((p) => p.code);

describe('word bank', () => {
  test('has 6 categories of 30 words', () => {
    expect(CATEGORY_IDS).toHaveLength(6);
    for (const id of CATEGORY_IDS) expect(WORD_BANK[id]).toHaveLength(30);
  });

  test('every word has a hint and the right category', () => {
    for (const id of CATEGORY_IDS) {
      for (const entry of WORD_BANK[id]) {
        expect(entry.word.trim()).not.toBe('');
        expect(entry.hint.trim()).not.toBe('');
        expect(entry.category).toBe(id);
      }
    }
  });

  test('no hint gives the word away', () => {
    for (const entry of CATEGORY_IDS.flatMap((id) => WORD_BANK[id])) {
      expect(entry.hint.toLowerCase()).not.toContain(entry.word.toLowerCase());
    }
  });

  test('words are unique across the whole bank', () => {
    const all = CATEGORY_IDS.flatMap((id) => WORD_BANK[id].map((w) => w.word.toLowerCase()));
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('maxSpies', () => {
  test('is players minus 2, never below 1', () => {
    expect(maxSpies(3)).toBe(1);
    expect(maxSpies(6)).toBe(4);
    expect(maxSpies(10)).toBe(8);
    expect(maxSpies(0)).toBe(1);
  });
});

describe('validateSettings', () => {
  test('accepts a normal setup', () => {
    expect(validateSettings(settings())).toEqual([]);
  });

  test('needs at least 3 players', () => {
    expect(codes(settings({ players: players(2) }))).toContain('too-few-players');
    expect(codes(settings({ players: players(3) }))).toEqual([]);
  });

  test('needs at least 1 spy', () => {
    expect(codes(settings({ spyCount: 0 }))).toContain('too-few-spies');
  });

  test('allows at most players minus 2 spies', () => {
    expect(codes(settings({ players: players(5), spyCount: 3 }))).toEqual([]);
    expect(codes(settings({ players: players(5), spyCount: 4 }))).toContain('too-many-spies');
  });

  test('rejects blank and duplicate names', () => {
    const blank = [...players(3), { id: 'x', name: '  ' }];
    expect(codes(settings({ players: blank }))).toContain('blank-name');
    const dupes = [...players(3), { id: 'x', name: 'agent 0' }];
    expect(codes(settings({ players: dupes }))).toContain('duplicate-name');
  });

  test('needs a category or custom words', () => {
    expect(codes(settings({ categories: [] }))).toContain('no-words');
    const custom = [{ word: 'Teapot', hint: 'Brews', category: 'custom' as const }];
    expect(codes(settings({ categories: [], customWords: custom }))).toEqual([]);
  });

  test('custom words need both a word and a hint', () => {
    const custom = [{ word: 'Teapot', hint: '', category: 'custom' as const }];
    expect(codes(settings({ customWords: custom }))).toContain('incomplete-custom-word');
  });

  test('every problem has a readable message', () => {
    const problems = validateSettings(settings({ players: players(1), categories: [] }));
    expect(problems.length).toBeGreaterThan(0);
    for (const p of problems) expect(p.message.length).toBeGreaterThan(5);
  });
});

describe('buildWordPool', () => {
  test('combines chosen categories with custom words', () => {
    const custom = [{ word: ' Teapot ', hint: ' Brews ', category: 'custom' as const }];
    const pool = buildWordPool(settings({ categories: ['food', 'jobs'], customWords: custom }));
    expect(pool).toHaveLength(61);
    expect(pool).toContainEqual({ word: 'Teapot', hint: 'Brews', category: 'custom' });
  });
});

describe('startRound', () => {
  test('picks the right number of distinct spies from the players', () => {
    const s = settings({ players: players(8), spyCount: 3 });
    const random = seededRandom(1);
    for (let i = 0; i < 50; i++) {
      const { round } = startRound(s, random);
      expect(round.spyIds).toHaveLength(3);
      expect(new Set(round.spyIds).size).toBe(3);
      for (const id of round.spyIds) expect(s.players.map((p) => p.id)).toContain(id);
    }
  });

  test('spies are random: every player is a spy sometimes', () => {
    const s = settings({ players: players(6), spyCount: 1 });
    const random = seededRandom(42);
    const counts = new Map<string, number>();
    const runs = 1200;
    for (let i = 0; i < runs; i++) {
      const id = startRound(s, random).round.spyIds[0];
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    expect(counts.size).toBe(6);
    // Roughly uniform: each player about 200 times.
    for (const count of counts.values()) {
      expect(count).toBeGreaterThan(140);
      expect(count).toBeLessThan(260);
    }
  });

  test('first player is random from everyone, spies included', () => {
    const s = settings({ players: players(5), spyCount: 1 });
    const random = seededRandom(7);
    const firsts = new Set<string>();
    let spyWentFirst = false;
    for (let i = 0; i < 500; i++) {
      const { round } = startRound(s, random);
      firsts.add(round.firstPlayerId);
      if (round.spyIds.includes(round.firstPlayerId)) spyWentFirst = true;
    }
    expect(firsts.size).toBe(5);
    expect(spyWentFirst).toBe(true);
  });

  test('word and hint come from the chosen categories', () => {
    const s = settings({ categories: ['sports'] });
    const { round } = startRound(s, seededRandom(3));
    const entry = WORD_BANK.sports.find((w) => w.word === round.word);
    expect(entry).toBeDefined();
    expect(round.hint).toBe(entry!.hint);
    expect(round.category).toBe('sports');
  });

  test('same randomness gives the same round', () => {
    const a = startRound(settings(), seededRandom(99)).round;
    const b = startRound(settings(), seededRandom(99)).round;
    expect(a).toEqual(b);
  });

  test('words do not repeat until the whole list is used', () => {
    const s = settings({ categories: ['animals'] });
    const random = seededRandom(5);
    let used: string[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const result = startRound(s, random, used);
      expect(seen.has(result.round.word)).toBe(false);
      seen.add(result.round.word);
      used = result.usedWords;
    }
    expect(seen.size).toBe(30);
    expect(used).toHaveLength(30);

    // List exhausted: starts over, without repeating the last word straight away.
    const last = used[used.length - 1];
    const next = startRound(s, random, used);
    expect(next.usedWords).toHaveLength(1);
    expect(next.usedWords[0]).not.toBe(last);
  });

  test('ignores used keys from categories no longer selected', () => {
    const used = WORD_BANK.food.map(wordKey);
    const { round } = startRound(settings({ categories: ['food', 'jobs'] }), seededRandom(1), used);
    expect(round.category).toBe('jobs');
  });

  test('custom-only games work, and a single word can repeat', () => {
    const custom = [{ word: 'Teapot', hint: 'Brews', category: 'custom' as const }];
    const s = settings({ categories: [], customWords: custom });
    const first = startRound(s, seededRandom(1));
    const second = startRound(s, seededRandom(2), first.usedWords);
    expect(first.round.word).toBe('Teapot');
    expect(second.round.word).toBe('Teapot');
    expect(second.round.hint).toBe('Brews');
  });

  test('throws on invalid settings', () => {
    expect(() => startRound(settings({ players: players(2) }), seededRandom(1))).toThrow(
      /at least 3/,
    );
  });
});

describe('random helpers', () => {
  test('shuffle keeps every item', () => {
    const items = [1, 2, 3, 4, 5, 6];
    expect(shuffle(seededRandom(1), items).sort()).toEqual(items);
  });

  test('seededRandom stays in [0, 1)', () => {
    const random = seededRandom(123);
    for (let i = 0; i < 1000; i++) {
      const n = random();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });
});

test('core never calls Math.random or touches the browser', () => {
  const dir = __dirname;
  const sources = readdirSync(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'));
  for (const file of sources) {
    const code = readFileSync(join(dir, file), 'utf8');
    expect(code, file).not.toMatch(/Math\.random/);
    expect(code, file).not.toMatch(/\b(window|document|localStorage|react)\b/);
  }
});
