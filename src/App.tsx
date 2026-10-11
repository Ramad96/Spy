import { useEffect, useState } from 'react';
import { startRound, type Round, type Settings } from './core';
import { SetupScreen } from './screens/SetupScreen';
import { loadSettings, loadUsedWords, saveSettings, saveUsedWords } from './state/storage';

type Screen = { name: 'setup' } | { name: 'briefing'; round: Round };

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [screen, setScreen] = useState<Screen>({ name: 'setup' });

  useEffect(() => saveSettings(settings), [settings]);

  function newMission() {
    const result = startRound(settings, Math.random, loadUsedWords());
    saveUsedWords(result.usedWords);
    setScreen({ name: 'briefing', round: result.round });
  }

  if (screen.name === 'briefing') {
    return (
      <main className="app">
        <div className="screen">
          <h1 className="title">Mission ready</h1>
          <button type="button" className="btn" onClick={() => setScreen({ name: 'setup' })}>
            Back to setup
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="app">
      <SetupScreen settings={settings} onChange={setSettings} onStart={newMission} />
    </main>
  );
}
