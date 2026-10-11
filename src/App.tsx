import { useEffect, useState } from 'react';
import { startRound, type Round, type Settings } from './core';
import { RevealScreen } from './screens/RevealScreen';
import { RoundScreen } from './screens/RoundScreen';
import { SetupScreen } from './screens/SetupScreen';
import { loadSettings, loadUsedWords, saveSettings, saveUsedWords } from './state/storage';

type Screen =
  | { name: 'setup' }
  | { name: 'reveal'; round: Round; id: number }
  | { name: 'round'; round: Round; id: number };

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [screen, setScreen] = useState<Screen>({ name: 'setup' });

  useEffect(() => saveSettings(settings), [settings]);

  function newMission() {
    const result = startRound(settings, Math.random, loadUsedWords());
    saveUsedWords(result.usedWords);
    setScreen({ name: 'reveal', round: result.round, id: Date.now() });
  }

  const backToSetup = () => setScreen({ name: 'setup' });

  return (
    <main className="app">
      {screen.name === 'setup' && (
        <SetupScreen settings={settings} onChange={setSettings} onStart={newMission} />
      )}
      {screen.name === 'reveal' && (
        <RevealScreen
          key={screen.id}
          players={settings.players}
          round={screen.round}
          onComplete={() => setScreen({ ...screen, name: 'round' })}
          onAbort={backToSetup}
        />
      )}
      {screen.name === 'round' && (
        <RoundScreen
          key={screen.id}
          players={settings.players}
          round={screen.round}
          onNewMission={newMission}
          onBackToSetup={backToSetup}
        />
      )}
    </main>
  );
}
