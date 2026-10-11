import { act, render } from '@testing-library/react';
import { vi } from 'vitest';
import { mockReducedMotion } from '../test-utils';
import { Scramble } from './Scramble';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test('decodes into the word over about a second, then calls onDone', () => {
  vi.useFakeTimers();
  mockReducedMotion(false);
  const onDone = vi.fn();
  const { container } = render(<Scramble text="Pizza" duration={1000} onDone={onDone} />);

  act(() => vi.advanceTimersByTime(500));
  expect(onDone).not.toHaveBeenCalled();

  act(() => vi.advanceTimersByTime(600));
  expect(onDone).toHaveBeenCalledTimes(1);
  expect(container.textContent).toBe('Pizza');
});

test('hidden text is noise of a fixed length, so the word length is not leaked', () => {
  vi.useFakeTimers();
  mockReducedMotion(false);
  const { container, rerender } = render(<Scramble text="Hi" />);
  act(() => vi.advanceTimersByTime(1100));
  expect(container.textContent).toBe('Hi');

  rerender(<Scramble text={null} />);
  act(() => vi.advanceTimersByTime(200));
  expect(container.textContent).not.toContain('Hi');
  expect(container.textContent).toHaveLength(10);
});

test('glitch mode lands on the given text', () => {
  vi.useFakeTimers();
  mockReducedMotion(false);
  const { container } = render(<Scramble text="ACCESS DENIED" glitch />);
  act(() => vi.advanceTimersByTime(600));
  expect(container.querySelector('.is-glitching')).not.toBeNull();
  act(() => vi.advanceTimersByTime(600));
  expect(container.textContent).toBe('ACCESS DENIED');
  expect(container.querySelector('.is-glitching')).toBeNull();
});

test('reduced motion shows the word straight away', () => {
  mockReducedMotion(true);
  const onDone = vi.fn();
  const { container } = render(<Scramble text="Pizza" onDone={onDone} />);
  expect(container.textContent).toBe('Pizza');
  expect(onDone).toHaveBeenCalled();
});
