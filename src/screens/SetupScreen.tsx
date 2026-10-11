import { useRef, useState, type FormEvent } from 'react';
import {
  CATEGORY_IDS,
  CATEGORY_LABELS,
  maxSpies,
  validateSettings,
  type CategoryId,
  type Settings,
} from '../core';
import { PlayerList } from '../components/PlayerList';
import { SoundToggle } from '../components/SoundToggle';
import { Stepper } from '../components/Stepper';
import { Typewriter } from '../components/Typewriter';
import { newId } from '../state/storage';

interface SetupScreenProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onStart: () => void;
}

/** Keeps the spy count legal whenever the player list changes. */
function withPlayers(settings: Settings, players: Settings['players']): Settings {
  return { ...settings, players, spyCount: Math.min(settings.spyCount, maxSpies(players.length)) };
}

export function SetupScreen({ settings, onChange, onStart }: SetupScreenProps) {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [word, setWord] = useState('');
  const [hint, setHint] = useState('');
  const wordRef = useRef<HTMLInputElement>(null);

  const problems = validateSettings(settings);
  const spyMax = maxSpies(settings.players.length);

  function addPlayer(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (settings.players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setNameError(`${trimmed} is already on the team`);
      return;
    }
    onChange(withPlayers(settings, [...settings.players, { id: newId(), name: trimmed }]));
    setName('');
    setNameError('');
  }

  function removePlayer(id: string) {
    onChange(
      withPlayers(
        settings,
        settings.players.filter((p) => p.id !== id),
      ),
    );
  }

  function movePlayer(from: number, to: number) {
    const players = [...settings.players];
    const [moved] = players.splice(from, 1);
    players.splice(to, 0, moved);
    onChange({ ...settings, players });
  }

  function toggleCategory(id: CategoryId) {
    const categories = settings.categories.includes(id)
      ? settings.categories.filter((c) => c !== id)
      : CATEGORY_IDS.filter((c) => c === id || settings.categories.includes(c));
    onChange({ ...settings, categories });
  }

  function addWord(e: FormEvent) {
    e.preventDefault();
    if (!word.trim() || !hint.trim()) return;
    onChange({
      ...settings,
      customWords: [
        ...settings.customWords,
        { word: word.trim(), hint: hint.trim(), category: 'custom' },
      ],
    });
    setWord('');
    setHint('');
    wordRef.current?.focus();
  }

  function removeWord(index: number) {
    onChange({ ...settings, customWords: settings.customWords.filter((_, i) => i !== index) });
  }

  return (
    <div className="screen setup-screen">
      <header className="screen-header">
        <div className="row-between">
          <p className="eyebrow">Spy HQ // Control</p>
          <SoundToggle />
        </div>
        <Typewriter as="h1" className="title" text="Mission setup" />
      </header>

      <section className="panel" aria-labelledby="agents-heading">
        <h2 id="agents-heading" className="panel-title">
          Agents <span className="count">{settings.players.length}</span>
        </h2>
        <form className="inline-form" onSubmit={addPlayer}>
          <input
            className="input"
            aria-label="Agent name"
            placeholder="Agent name"
            value={name}
            maxLength={24}
            autoComplete="off"
            enterKeyHint="next"
            onChange={(e) => {
              setName(e.target.value);
              setNameError('');
            }}
          />
          <button type="submit" className="btn" disabled={!name.trim()}>
            Add
          </button>
        </form>
        {nameError && (
          <p className="field-error" role="alert">
            {nameError}
          </p>
        )}
        <PlayerList players={settings.players} onRemove={removePlayer} onMove={movePlayer} />
      </section>

      <section className="panel" aria-labelledby="spies-heading">
        <h2 id="spies-heading" className="panel-title">
          Spies
        </h2>
        <div className="row-between">
          <p className="muted">Up to {spyMax} with this many agents</p>
          <Stepper
            label="Spies"
            value={settings.spyCount}
            min={1}
            max={spyMax}
            onChange={(spyCount) => onChange({ ...settings, spyCount })}
          />
        </div>
      </section>

      <section className="panel" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="panel-title">
          Categories
        </h2>
        <div className="category-grid">
          {CATEGORY_IDS.map((id) => (
            <label key={id} className="check">
              <input
                type="checkbox"
                checked={settings.categories.includes(id)}
                onChange={() => toggleCategory(id)}
              />
              <span>{CATEGORY_LABELS[id]}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="panel" aria-labelledby="custom-heading">
        <h2 id="custom-heading" className="panel-title">
          Custom words <span className="count">{settings.customWords.length}</span>
        </h2>
        <form className="word-form" onSubmit={addWord}>
          <input
            ref={wordRef}
            className="input"
            aria-label="Secret word"
            placeholder="Secret word"
            value={word}
            maxLength={30}
            autoComplete="off"
            onChange={(e) => setWord(e.target.value)}
          />
          <input
            className="input"
            aria-label="Spy hint"
            placeholder="Spy hint"
            value={hint}
            maxLength={40}
            autoComplete="off"
            onChange={(e) => setHint(e.target.value)}
          />
          <button type="submit" className="btn" disabled={!word.trim() || !hint.trim()}>
            Add word
          </button>
        </form>
        {settings.customWords.length > 0 && (
          <ul className="word-list">
            {settings.customWords.map((w, i) => (
              <li key={`${w.word}-${i}`} className="word-row">
                <span className="word-text">{w.word}</span>
                <span className="word-hint">{w.hint}</span>
                <button
                  type="button"
                  className="btn btn-icon btn-ghost"
                  aria-label={`Delete ${w.word}`}
                  onClick={() => removeWord(i)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="action-bar">
        {problems.length > 0 && (
          <p className="blocker" role="status">
            {problems[0].message}
          </p>
        )}
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={problems.length > 0}
          onClick={onStart}
        >
          Start mission
        </button>
      </footer>
    </div>
  );
}
