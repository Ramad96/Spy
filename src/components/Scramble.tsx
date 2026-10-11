import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../theme/useReducedMotion';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@*';
const GLITCH_GLYPHS = '!?#%&*/\\|<>_~^';
const NOISE_LENGTH = 10;
const TICK_MS = 45;

function randomChar(set: string) {
  return set[Math.floor(Math.random() * set.length)];
}

function noise(length: number, set = GLYPHS) {
  return Array.from({ length }, () => randomChar(set)).join('');
}

/** One animation frame: settled letters on the left, random ones on the right. */
function decodeFrame(text: string, progress: number) {
  const settled = Math.floor(progress * text.length);
  return [...text].map((ch, i) => (i < settled || ch === ' ' ? ch : randomChar(GLYPHS))).join('');
}

/** Starts decoding like a normal word, then breaks down into garbage. */
function glitchFrame(text: string, progress: number) {
  if (progress < 0.45) return decodeFrame(noise(text.length), progress);
  return noise(text.length, GLITCH_GLYPHS);
}

interface ScrambleProps {
  /** Text to decode into, or null to show shifting noise that hides the word and its length. */
  text: string | null;
  /** Spy mode: the decode fails before landing on the text. */
  glitch?: boolean;
  duration?: number;
  onDone?: () => void;
  className?: string;
}

export function Scramble({
  text,
  glitch = false,
  duration = 1000,
  onDone,
  className,
}: ScrambleProps) {
  const reduced = useReducedMotion();
  const [frame, setFrame] = useState(() => noise(NOISE_LENGTH));
  const [animating, setAnimating] = useState(false);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (text === null) {
      if (reduced) return;
      const id = setInterval(() => setFrame(noise(NOISE_LENGTH)), 90);
      return () => clearInterval(id);
    }
    if (reduced) {
      onDoneRef.current?.();
      return;
    }
    const start = Date.now();
    const id = setInterval(() => {
      const progress = Math.min(1, (Date.now() - start) / duration);
      if (progress >= 1) {
        clearInterval(id);
        setFrame(text);
        setAnimating(false);
        onDoneRef.current?.();
        return;
      }
      setAnimating(true);
      setFrame(glitch ? glitchFrame(text, progress) : decodeFrame(text, progress));
    }, TICK_MS);
    return () => {
      clearInterval(id);
      setAnimating(false);
    };
  }, [text, glitch, duration, reduced]);

  // With reduced motion there is no animation: hidden text is a fixed mask.
  const shown = reduced ? (text ?? '#'.repeat(NOISE_LENGTH)) : frame;
  const classes = [
    'scramble',
    text === null ? 'is-hidden' : '',
    glitch && animating ? 'is-glitching' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} aria-hidden={text === null || animating}>
      {shown}
    </span>
  );
}
