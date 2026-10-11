import { setSoundEnabled, useSoundEnabled } from '../theme/sound';

export function SoundToggle() {
  const on = useSoundEnabled();
  return (
    <button
      type="button"
      className="btn btn-ghost btn-small"
      aria-pressed={on}
      onClick={() => setSoundEnabled(!on)}
    >
      Sound {on ? 'on' : 'off'}
    </button>
  );
}
