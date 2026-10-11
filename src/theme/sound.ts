import { useSyncExternalStore } from 'react';

/** Tiny synthesised sound effects (no audio files), off unless the player turns them on. */

const KEY = 'spy.sound.v1';
type Effect = 'typing' | 'beep' | 'alarm';

let enabled = readEnabled();
let ctx: AudioContext | undefined;
const listeners = new Set<() => void>();

function readEnabled() {
  try {
    return localStorage.getItem(KEY) === 'on';
  } catch {
    return false;
  }
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // Not remembered, but still works for this session.
  }
  listeners.forEach((l) => l());
  if (on) playSound('beep');
}

export function useSoundEnabled(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => enabled,
  );
}

function audio(): AudioContext | undefined {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return undefined;
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(
  ac: AudioContext,
  freq: number,
  start: number,
  length: number,
  type: OscillatorType,
  volume: number,
) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + length);
}

export function playSound(effect: Effect) {
  if (!enabled) return;
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  switch (effect) {
    case 'typing':
      for (let i = 0; i < 14; i++) {
        tone(ac, 1800 + Math.random() * 900, now + i * 0.065, 0.025, 'square', 0.03);
      }
      break;
    case 'beep':
      tone(ac, 880, now, 0.12, 'sine', 0.12);
      tone(ac, 1320, now + 0.13, 0.16, 'sine', 0.12);
      break;
    case 'alarm':
      for (let i = 0; i < 4; i++) {
        tone(ac, i % 2 ? 440 : 660, now + i * 0.18, 0.17, 'sawtooth', 0.08);
      }
      break;
  }
}
