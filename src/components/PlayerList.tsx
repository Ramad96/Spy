import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { Player } from '../core';

interface PlayerListProps {
  players: Player[];
  onRemove: (id: string) => void;
  onMove: (from: number, to: number) => void;
}

/** Players in reveal order. Drag the handle (or use arrow keys on it) to reorder. */
export function PlayerList({ players, onRemove, onMove }: PlayerListProps) {
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);

  function onPointerDown(e: PointerEvent<HTMLButtonElement>, index: number) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(index);
  }

  function onPointerMove(e: PointerEvent<HTMLButtonElement>) {
    if (dragging === null) return;
    const target = rowRefs.current.findIndex((row) => {
      if (!row) return false;
      const rect = row.getBoundingClientRect();
      return e.clientY >= rect.top && e.clientY <= rect.bottom;
    });
    if (target !== -1 && target !== dragging) {
      onMove(dragging, target);
      setDragging(target);
    }
  }

  function endDrag() {
    setDragging(null);
  }

  function onHandleKey(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      onMove(index, index - 1);
    } else if (e.key === 'ArrowDown' && index < players.length - 1) {
      e.preventDefault();
      onMove(index, index + 1);
    }
  }

  if (players.length === 0) {
    return <p className="muted">No agents yet. Add at least 3.</p>;
  }

  return (
    <ol className="player-list">
      {players.map((player, index) => (
        <li
          key={player.id}
          ref={(el) => {
            rowRefs.current[index] = el;
          }}
          className={`player-row${dragging === index ? ' is-dragging' : ''}`}
        >
          <button
            type="button"
            className="drag-handle"
            aria-label={`Reorder ${player.name}`}
            onPointerDown={(e) => onPointerDown(e, index)}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={(e) => onHandleKey(e, index)}
          >
            ⠿
          </button>
          <span className="player-index">{String(index + 1).padStart(2, '0')}</span>
          <span className="player-name">{player.name}</span>
          <button
            type="button"
            className="btn btn-icon btn-ghost"
            aria-label={`Remove ${player.name}`}
            onClick={() => onRemove(player.id)}
          >
            ✕
          </button>
        </li>
      ))}
    </ol>
  );
}
