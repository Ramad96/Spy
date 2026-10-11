import { useEffect, useState } from 'react';
import type { Player, Round } from '../core';
import { Scramble } from '../components/Scramble';
import { useBlockBack } from '../state/useBlockBack';
import { playSound } from '../theme/sound';

interface RevealScreenProps {
  players: Player[];
  round: Round;
  onComplete: () => void;
  onAbort: () => void;
}

type Step = 'pass' | 'revealing' | 'revealed' | 'secured';

export const SPY_HEADLINE = 'ACCESS DENIED';

export function RevealScreen({ players, round, onComplete, onAbort }: RevealScreenProps) {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState<Step>('pass');
  useBlockBack(true);

  const player = players[index];
  const isSpy = round.spyIds.includes(player.id);
  const isLast = index === players.length - 1;
  const showing = step === 'revealing' || step === 'revealed';

  // If the phone is locked or the app is switched away mid-reveal, hide the word.
  useEffect(() => {
    if (!showing) return;
    const onHide = () => {
      if (document.visibilityState === 'hidden') setStep('secured');
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [showing]);

  function nextPlayer() {
    if (isLast) {
      onComplete();
      return;
    }
    setIndex(index + 1);
    setStep('pass');
  }

  function abort() {
    if (window.confirm('Abort this mission? Everyone will need a new briefing.')) onAbort();
  }

  return (
    <div className={`screen reveal-screen${isSpy && showing ? ' is-spy' : ''}`}>
      <header className="screen-header row-between">
        <p className="eyebrow">
          Agent {index + 1} of {players.length}
        </p>
        <button type="button" className="btn btn-ghost btn-small" onClick={abort}>
          Abort
        </button>
      </header>

      {step === 'pass' ? (
        <button
          type="button"
          className="pass-card"
          onClick={() => {
            playSound('typing');
            setStep('revealing');
          }}
        >
          <span className="eyebrow">Pass to</span>
          <span className="pass-name">{player.name}</span>
          <Scramble text={null} className="scramble-lg" />
          <span className="muted">Only {player.name} looks. Tap to decrypt.</span>
        </button>
      ) : (
        <section className="dossier" aria-live="polite">
          {step === 'revealed' && (
            <span className="stamp" aria-hidden="true">
              Classified
            </span>
          )}
          <p className="eyebrow">{player.name} // Eyes only</p>
          <Scramble
            text={showing ? (isSpy ? SPY_HEADLINE : round.word) : null}
            glitch={isSpy}
            className={`scramble-lg${isSpy ? ' scramble-spy' : ''}`}
            onDone={() => {
              if (step !== 'revealing') return;
              playSound(isSpy ? 'alarm' : 'beep');
              setStep('revealed');
            }}
          />
          {step === 'revealed' &&
            (isSpy ? (
              <div className="spy-brief">
                <p className="spy-title">You are the spy.</p>
                <p>
                  Your hint: <strong className="hint">{round.hint}</strong>
                </p>
              </div>
            ) : (
              <p className="muted">Your secret word. Don&rsquo;t say it out loud.</p>
            ))}
          {step === 'secured' && <p className="muted">Secured. Nobody else can see it.</p>}
        </section>
      )}

      <footer className="action-bar">
        {step === 'revealed' && (
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => setStep('secured')}
          >
            Word secured
          </button>
        )}
        {step === 'secured' && (
          <button type="button" className="btn btn-primary btn-block" onClick={nextPlayer}>
            {isLast ? 'Finish briefing' : 'Next player'}
          </button>
        )}
      </footer>
    </div>
  );
}
