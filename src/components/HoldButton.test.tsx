import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { HoldButton } from './HoldButton';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

test('fires only after being held long enough', () => {
  const onConfirm = vi.fn();
  render(<HoldButton onConfirm={onConfirm}>Hold</HoldButton>);
  const button = screen.getByRole('button', { name: 'Hold' });

  fireEvent.pointerDown(button);
  act(() => vi.advanceTimersByTime(600));
  fireEvent.pointerUp(button);
  act(() => vi.advanceTimersByTime(2000));
  expect(onConfirm).not.toHaveBeenCalled();

  fireEvent.pointerDown(button);
  act(() => vi.advanceTimersByTime(1200));
  expect(onConfirm).toHaveBeenCalledTimes(1);
});

test('a quick tap or click does nothing', () => {
  const onConfirm = vi.fn();
  render(<HoldButton onConfirm={onConfirm}>Hold</HoldButton>);
  fireEvent.click(screen.getByRole('button', { name: 'Hold' }));
  act(() => vi.advanceTimersByTime(2000));
  expect(onConfirm).not.toHaveBeenCalled();
});

test('works from the keyboard by holding Space', () => {
  const onConfirm = vi.fn();
  render(<HoldButton onConfirm={onConfirm}>Hold</HoldButton>);
  const button = screen.getByRole('button', { name: 'Hold' });
  fireEvent.keyDown(button, { key: ' ' });
  act(() => vi.advanceTimersByTime(1300));
  expect(onConfirm).toHaveBeenCalledTimes(1);
});
