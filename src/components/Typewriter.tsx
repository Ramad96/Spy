import { useEffect, useState, type ElementType } from 'react';
import { useReducedMotion } from '../theme/useReducedMotion';

interface TypewriterProps {
  text: string;
  as?: ElementType;
  className?: string;
  /** ms per character */
  speed?: number;
}

/** Types its text out one character at a time. Screen readers get the whole text at once. */
export function Typewriter({ text, as: Tag = 'span', className, speed = 45 }: TypewriterProps) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setCount(n);
      if (n >= text.length) clearInterval(id);
    }, speed);
    return () => {
      clearInterval(id);
      setCount(0);
    };
  }, [text, speed, reduced]);

  const done = reduced || count >= text.length;
  return (
    <Tag className={className} aria-label={text}>
      <span aria-hidden="true">
        {done ? text : text.slice(0, count)}
        {!done && <span className="typewriter-caret">▌</span>}
      </span>
    </Tag>
  );
}
