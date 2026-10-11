import { useState } from 'react';
import { CATEGORY_LABELS, type Player, type Round } from '../core';
import { HoldButton } from '../components/HoldButton';

interface RoundScreenProps {
  players: Player[];
  round: Round;
  onNewMission: () => void;
  onBackToSetup: () => void;
}

export function RoundScreen({ players, round, onNewMission, onBackToSetup }: RoundScreenProps) {
  const [revealed, setRevealed] = useState(false);
  const first = players.find((p) => p.id === round.firstPlayerId);
  const spies = players.filter((p) => round.spyIds.includes(p.id));
  const category = round.category === 'custom' ? 'Custom' : CATEGORY_LABELS[round.category];

  return (
    <div className="screen round-screen">
      <header className="screen-header">
        <p className="eyebrow">Briefing complete</p>
        <h1 className="title">All agents briefed</h1>
        <p className="lead">Mission begins.</p>
      </header>

      <section className="panel first-up" aria-labelledby="first-heading">
        <h2 id="first-heading" className="panel-title">
          First hint
        </h2>
        <p className="first-name">{first?.name}</p>
        <p className="muted">
          gives the first clue. Go round the circle, then vote on who the{' '}
          {spies.length > 1 ? 'spies are' : 'spy is'}.
        </p>
      </section>

      <section className="panel" aria-labelledby="debrief-heading">
        <h2 id="debrief-heading" className="panel-title">
          Debrief
        </h2>
        {revealed ? (
          <div className="debrief" aria-live="polite">
            <p className="muted">{spies.length > 1 ? 'The spies were' : 'The spy was'}</p>
            <ul className="spy-names">
              {spies.map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
            <p className="muted">
              The word was <strong className="debrief-word">{round.word}</strong> ({category}).
              <br />
              Spy hint: {round.hint}
            </p>
          </div>
        ) : (
          <HoldButton className="btn-block btn-danger" onConfirm={() => setRevealed(true)}>
            Hold to reveal {spies.length > 1 ? 'spies' : 'spy'}
          </HoldButton>
        )}
      </section>

      <footer className="action-bar">
        <button type="button" className="btn btn-primary btn-block" onClick={onNewMission}>
          New mission
        </button>
        <button type="button" className="btn btn-block" onClick={onBackToSetup}>
          Back to setup
        </button>
      </footer>
    </div>
  );
}
