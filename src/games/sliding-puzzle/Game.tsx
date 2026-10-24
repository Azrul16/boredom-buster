"use client";
import { useState } from "react";
import MiniGame, { type RoundProps } from "@/games/shared/MiniGame";
import { makeSliding, neighbors } from "@/games/shared/puzzles";
import { useKeys } from "@/hooks/useGame";

export default function Game() {
  return <MiniGame slug="sliding-puzzle" board={Board} />;
}
function Board({ complete, level }: RoundProps) {
  const [board, setBoard] = useState(() => makeSliding([6, 30, 100][level]));
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  function move(index: number) {
    const blank = board.indexOf(0);
    if (done || !neighbors(blank, 3).includes(index)) return;
    const next = [...board];
    [next[blank], next[index]] = [next[index], next[blank]];
    setBoard(next);
    setMoves(moves + 1);
    if (next.every((value, i) => value === (i + 1) % 9)) {
      setDone(true);
      complete(
        Math.max(10, 500 - (moves + 1) * 5),
        true,
        "Everything in order!",
      );
    }
  }
  useKeys((key) => {
    const blank = board.indexOf(0),
      delta = { ArrowUp: 3, ArrowDown: -3, ArrowLeft: 1, ArrowRight: -1 }[key];
    if (delta !== undefined) move(blank + delta);
  });
  return (
    <>
      <p className="mini-kicker">
        MOVES <b>{moves}</b>
      </p>
      <div className="mini-grid slide-grid">
        {board.map((value, index) => (
          <button
            className={value ? "number-tile" : "empty-tile"}
            key={index}
            aria-label={value ? `Slide tile ${value}` : "Empty space"}
            disabled={!value || done}
            onClick={() => move(index)}
          >
            {value || ""}
          </button>
        ))}
      </div>
    </>
  );
}
