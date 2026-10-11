import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SoundToggle } from '../components/SoundToggle';
import { Typewriter } from '../components/Typewriter';
import { mockReducedMotion } from '../test-utils';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test('typewriter types the text out, and screen readers get it all at once', () => {
  vi.useFakeTimers();
  mockReducedMotion(false);
  render(<Typewriter as="h1" text="Mission setup" speed={40} />);
  const heading = screen.getByRole('heading', { name: 'Mission setup' });
  act(() => vi.advanceTimersByTime(40 * 4));
  expect(heading.textContent).toMatch(/^Miss/);
  expect(heading.textContent).not.toContain('setup');
  act(() => vi.advanceTimersByTime(40 * 20));
  expect(heading.textContent).toBe('Mission setup');
});

test('typewriter skips the animation with reduced motion', () => {
  mockReducedMotion(true);
  render(<Typewriter as="h1" text="Mission setup" />);
  expect(screen.getByRole('heading').textContent).toBe('Mission setup');
});

test('sound is off by default and the choice is remembered', async () => {
  const user = userEvent.setup();
  const { unmount } = render(<SoundToggle />);
  const toggle = screen.getByRole('button', { name: 'Sound off' });
  expect(toggle).toHaveAttribute('aria-pressed', 'false');
  // jsdom has no AudioContext: turning sound on must not crash.
  await user.click(toggle);
  expect(screen.getByRole('button', { name: 'Sound on' })).toHaveAttribute('aria-pressed', 'true');
  expect(localStorage.getItem('spy.sound.v1')).toBe('on');
  unmount();
  render(<SoundToggle />);
  await user.click(screen.getByRole('button', { name: 'Sound on' }));
  expect(localStorage.getItem('spy.sound.v1')).toBe('off');
});

test('all animations are switched off for prefers-reduced-motion', () => {
  const css = readFileSync(join(__dirname, 'effects.css'), 'utf8');
  expect(css).toMatch(
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*animation: none !important[\s\S]*transition: none !important/,
  );
});

test('screens use theme tokens, not hard-coded colours', () => {
  const css = readFileSync(join(__dirname, 'global.css'), 'utf8');
  expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
});
