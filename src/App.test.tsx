import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from './App';
import { mockReducedMotion } from './test-utils';

beforeEach(() => localStorage.clear());

async function addAgents(user: ReturnType<typeof userEvent.setup>, names: string[]) {
  const input = screen.getByRole('textbox', { name: 'Agent name' });
  for (const name of names) await user.type(input, `${name}{Enter}`);
}

test('a 6-player game can be set up with typing and Enter only', async () => {
  const user = userEvent.setup();
  render(<App />);
  const start = screen.getByRole('button', { name: 'Start mission' });
  expect(start).toBeDisabled();
  expect(screen.getByText(/add at least 3 agents/i)).toBeInTheDocument();

  await addAgents(user, ['Ana', 'Ben', 'Cal', 'Dee', 'Eve', 'Fin']);
  expect(screen.getAllByRole('listitem')).toHaveLength(6);
  expect(start).toBeEnabled();
  expect(screen.getByRole('textbox', { name: 'Agent name' })).toHaveValue('');
});

test('setup is still there after a refresh', async () => {
  const user = userEvent.setup();
  const { unmount } = render(<App />);
  await addAgents(user, ['Ana', 'Ben', 'Cal', 'Dee']);
  await user.click(screen.getByRole('button', { name: 'More spies' }));
  await user.click(screen.getByRole('checkbox', { name: 'Movies' }));
  await user.type(screen.getByRole('textbox', { name: 'Secret word' }), 'Teapot');
  await user.type(screen.getByRole('textbox', { name: 'Spy hint' }), 'Brews{Enter}');
  unmount();

  render(<App />);
  expect(screen.getByText('Dee')).toBeInTheDocument();
  expect(screen.getByRole('status', { name: 'Spies' })).toHaveTextContent('2');
  expect(screen.getByRole('checkbox', { name: 'Movies' })).not.toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'Food' })).toBeChecked();
  expect(screen.getByText('Teapot')).toBeInTheDocument();
});

test('spy counter is limited by the number of agents', async () => {
  const user = userEvent.setup();
  render(<App />);
  await addAgents(user, ['Ana', 'Ben', 'Cal', 'Dee']);
  const more = screen.getByRole('button', { name: 'More spies' });
  await user.click(more);
  expect(more).toBeDisabled();
  expect(screen.getByRole('status', { name: 'Spies' })).toHaveTextContent('2');

  // Removing an agent pulls the spy count back down.
  await user.click(screen.getByRole('button', { name: 'Remove Dee' }));
  expect(screen.getByRole('status', { name: 'Spies' })).toHaveTextContent('1');
});

test('duplicate names are refused', async () => {
  const user = userEvent.setup();
  render(<App />);
  await addAgents(user, ['Ana', 'ana']);
  expect(screen.getByRole('alert')).toHaveTextContent(/already on the team/);
  expect(screen.getAllByRole('listitem')).toHaveLength(1);
});

test('start shows why when no words are available', async () => {
  const user = userEvent.setup();
  render(<App />);
  await addAgents(user, ['Ana', 'Ben', 'Cal']);
  for (const name of ['Food', 'Animals', 'Places', 'Jobs', 'Sports', 'Movies']) {
    await user.click(screen.getByRole('checkbox', { name }));
  }
  expect(screen.getByRole('button', { name: 'Start mission' })).toBeDisabled();
  expect(screen.getByText(/pick a category or add a custom word/i)).toBeInTheDocument();

  await user.type(screen.getByRole('textbox', { name: 'Secret word' }), 'Teapot');
  await user.type(screen.getByRole('textbox', { name: 'Spy hint' }), 'Brews');
  await user.click(screen.getByRole('button', { name: 'Add word' }));
  expect(screen.getByRole('button', { name: 'Start mission' })).toBeEnabled();

  await user.click(screen.getByRole('button', { name: 'Delete Teapot' }));
  expect(screen.getByRole('button', { name: 'Start mission' })).toBeDisabled();
});

test('agents can be reordered from the handle', async () => {
  const user = userEvent.setup();
  render(<App />);
  await addAgents(user, ['Ana', 'Ben', 'Cal']);
  screen.getByRole('button', { name: 'Reorder Cal' }).focus();
  await user.keyboard('{ArrowUp}');
  const names = screen
    .getAllByRole('listitem')
    .map((li) => li.querySelector('.player-name')!.textContent);
  expect(names).toEqual(['Ana', 'Cal', 'Ben']);
});

test('broken saved data falls back to defaults', () => {
  localStorage.setItem('spy.settings.v1', '{not json');
  render(<App />);
  expect(screen.getByRole('button', { name: 'Start mission' })).toBeDisabled();
  expect(screen.getByRole('checkbox', { name: 'Sports' })).toBeChecked();
});

test('three missions can be played in a row without going back to setup', async () => {
  mockReducedMotion(true);
  const user = userEvent.setup();
  render(<App />);
  await addAgents(user, ['Ana', 'Ben', 'Cal', 'Dee']);
  await user.click(screen.getByRole('button', { name: 'Start mission' }));

  const words = new Set<string>();
  for (let mission = 0; mission < 3; mission++) {
    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole('button', { name: /tap to decrypt/i }));
      const shown = document.querySelector('.scramble')!.textContent!;
      if (shown !== 'ACCESS DENIED') words.add(shown);
      await user.click(screen.getByRole('button', { name: 'Word secured' }));
      await user.click(
        screen.getByRole('button', { name: i === 3 ? 'Finish briefing' : 'Next player' }),
      );
    }
    expect(screen.getByText(/all agents briefed/i)).toBeInTheDocument();
    if (mission < 2) await user.click(screen.getByRole('button', { name: 'New mission' }));
  }
  // Each mission dealt a different word.
  expect(words.size).toBe(3);

  await user.click(screen.getByRole('button', { name: 'Back to setup' }));
  expect(screen.getByRole('heading', { name: 'Mission setup' })).toBeInTheDocument();
  vi.unstubAllGlobals();
});
