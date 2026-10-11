import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface HoldButtonProps {
  children: ReactNode;
  onConfirm: () => void;
  /** How long it must be held, in ms. */
  holdMs?: number;
  className?: string;
}

/** A button that only fires after being held down, so it can't be tapped by accident. */
export function HoldButton({ children, onConfirm, holdMs = 1200, className }: HoldButtonProps) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function start() {
    clearTimeout(timer.current);
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      onConfirm();
    }, holdMs);
  }

  function cancel() {
    clearTimeout(timer.current);
    setHolding(false);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      className={`btn hold-btn${holding ? ' is-holding' : ''} ${className ?? ''}`}
      style={{ '--hold-ms': `${holdMs}ms` } as CSSProperties}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
          e.preventDefault();
          start();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') cancel();
      }}
    >
      <span className="hold-fill" aria-hidden="true" />
      <span className="hold-label">{children}</span>
    </button>
  );
}
