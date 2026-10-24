"use client";
import { useState } from "react";
import MiniGame, { type RoundProps } from "@/games/shared/MiniGame";
import { makeLights, toggleLights } from "@/games/shared/puzzles";

export default function Game() {
  return <MiniGame slug="lights-out" board={Board} />;
}
function Board({ complete, level }: RoundProps) {
  const size = level === 2 ? 5 : 4;
  const [board, setBoard] = useState(() => makeLights(size, [3, 7, 15][level]));
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  function toggle(i: number) {
    if (done) return;
    const next = toggleLights(board, i, size);
    setBoard(next);
    setMoves(moves + 1);
    if (!next.some(Boolean)) {
      setDone(true);
      complete(
        Math.max(10, 300 - (moves + 1) * 5),
        true,
        "Lights out. Nicely done!",
      );
    }
  }
  return (
    <>
      <div className="mini-metrics">
        <span>
          Moves <b>{moves}</b>
        </span>
        <span>
          Lights on <b>{board.filter(Boolean).length}</b>
        </span>
      </div>
      <div
        className="mini-grid lights-grid"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {board.map((lit, i) => (
          <button
            key={i}
            aria-label={`Light ${i + 1}`}
            aria-pressed={lit}
            className={lit ? "lit" : "unlit"}
            onClick={() => toggle(i)}
          >
            <span aria-hidden="true">{lit ? "☀" : "○"}</span>
          </button>
        ))}
      </div>
    </>
  );
}
