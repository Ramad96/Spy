import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import type { Player, Round } from '../core';
import { mockReducedMotion } from '../test-utils';
import { RevealScreen } from './RevealScreen';

const players: Player[] = ['Ana', 'Ben', 'Cal', 'Dee', 'Eve'].map((name, i) => ({
  id: `p${i}`,
  name,
}));
const round: Round = {
  word: 'Pizza',
  hint: 'Sliced and shared',
  category: 'food',
  spyIds: ['p1'],
  firstPlayerId: 'p0',
};

beforeEach(() => mockReducedMotion(true));
afterEach(() => vi.unstubAllGlobals());

function setup() {
  const onComplete = vi.fn();
  const onAbort = vi.fn();
  render(
    <RevealScreen players={players} round={round} onComplete={onComplete} onAbort={onAbort} />,
  );
  return { user: userEvent.setup(), onComplete, onAbort };
}

test('passes the phone round 5 agents, each only seeing their own secret', async () => {
  const { user, onComplete } = setup();

  for (const [i, player] of players.entries()) {
    expect(screen.getByText(player.name)).toBeInTheDocument();
    expect(screen.getByText(/pass to/i)).toBeInTheDocument();
    // Nothing secret is on screen before they tap.
    expect(screen.queryByText('Pizza')).not.toBeInTheDocument();
    expect(screen.queryByText(/sliced and shared/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /tap to decrypt/i }));

    if (round.spyIds.includes(player.id)) {
      expect(screen.getByText('ACCESS DENIED')).toBeInTheDocument();
      expect(screen.getByText(/you are the spy/i)).toBeInTheDocument();
      expect(screen.getByText('Sliced and shared')).toBeInTheDocument();
      expect(screen.queryByText('Pizza')).not.toBeInTheDocument();
    } else {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
      expect(screen.queryByText(/you are the spy/i)).not.toBeInTheDocument();
    }

    await user.click(screen.getByRole('button', { name: 'Word secured' }));
    expect(screen.queryByText('Pizza')).not.toBeInTheDocument();
    expect(screen.queryByText('Sliced and shared')).not.toBeInTheDocument();

    const next = i === players.length - 1 ? 'Finish briefing' : 'Next player';
    await user.click(screen.getByRole('button', { name: next }));
  }

  expect(onComplete).toHaveBeenCalledTimes(1);
});

test('the back button cannot step back to an earlier player', async () => {
  const { user } = setup();
  await user.click(screen.getByRole('button', { name: /tap to decrypt/i }));
  await user.click(screen.getByRole('button', { name: 'Word secured' }));
  await user.click(screen.getByRole('button', { name: 'Next player' }));

  const pushState = vi.spyOn(history, 'pushState');
  window.dispatchEvent(new PopStateEvent('popstate'));
  expect(pushState).toHaveBeenCalled();
  expect(screen.getByText('Ben')).toBeInTheDocument();
  expect(screen.queryByText('Pizza')).not.toBeInTheDocument();
});

test('switching away from the app hides a revealed word', async () => {
  const { user } = setup();
  await user.click(screen.getByRole('button', { name: /tap to decrypt/i }));
  expect(screen.getByText('Pizza')).toBeInTheDocument();

  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
  document.dispatchEvent(new Event('visibilitychange'));
  expect(await screen.findByRole('button', { name: 'Next player' })).toBeInTheDocument();
  expect(screen.queryByText('Pizza')).not.toBeInTheDocument();
});

test('abort asks for confirmation', async () => {
  const { user, onAbort } = setup();
  vi.stubGlobal(
    'confirm',
    vi.fn(() => false),
  );
  await user.click(screen.getByRole('button', { name: 'Abort' }));
  expect(onAbort).not.toHaveBeenCalled();
  vi.stubGlobal(
    'confirm',
    vi.fn(() => true),
  );
  await user.click(screen.getByRole('button', { name: 'Abort' }));
  expect(onAbort).toHaveBeenCalled();
});
