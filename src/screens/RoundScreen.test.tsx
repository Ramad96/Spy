import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import type { Player, Round } from '../core';
import { RoundScreen } from './RoundScreen';

const players: Player[] = ['Ana', 'Ben', 'Cal', 'Dee'].map((name, i) => ({ id: `p${i}`, name }));
const round: Round = {
  word: 'Pizza',
  hint: 'Sliced and shared',
  category: 'food',
  spyIds: ['p1', 'p3'],
  firstPlayerId: 'p2',
};

test('shows who goes first and keeps spies hidden until held', () => {
  vi.useFakeTimers();
  render(
    <RoundScreen players={players} round={round} onNewMission={vi.fn()} onBackToSetup={vi.fn()} />,
  );
  expect(screen.getByRole('heading', { name: /all agents briefed/i })).toBeInTheDocument();
  expect(screen.getByText('Cal')).toBeInTheDocument();
  expect(screen.queryByText('Ben')).not.toBeInTheDocument();
  expect(screen.queryByText('Pizza')).not.toBeInTheDocument();

  fireEvent.pointerDown(screen.getByRole('button', { name: /hold to reveal spies/i }));
  act(() => vi.advanceTimersByTime(1300));
  expect(screen.getByText('Ben')).toBeInTheDocument();
  expect(screen.getByText('Dee')).toBeInTheDocument();
  expect(screen.getByText('Pizza')).toBeInTheDocument();
  vi.useRealTimers();
});
