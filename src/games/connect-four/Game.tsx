"use client";
import { useEffect, useState } from "react";
import MiniGame, { type RoundProps } from "@/games/shared/MiniGame";
import { connectWinner, botColumn, dropDisc } from "@/games/shared/puzzles";

export default function Game() {
  return <MiniGame slug="connect-four" board={Board} />;
}
function Board({ complete, level }: RoundProps) {
  const [board, setBoard] = useState<number[]>(Array(42).fill(0));
  const [turn, setTurn] = useState<"you" | "cpu" | "done">("you");
  function conclude(next: number[]) {
    const winner = connectWinner(next);
    if (winner || next.every(Boolean)) {
      setTurn("done");
      complete(
        winner === 1 ? 100 : winner === 2 ? 0 : 25,
        winner === 1,
        winner === 1
          ? "Four in a row!"
          : winner === 2
            ? "Ziggy connects four"
            : "A full-board draw",
      );
      return true;
    }
    return false;
  }
  useEffect(() => {
    if (turn !== "cpu") return;
    const timer = setTimeout(() => {
      const next = dropDisc(board, botColumn(board, level), 2)!;
      setBoard(next);
      const winner = connectWinner(next);
      if (winner || next.every(Boolean)) {
        setTurn("done");
        complete(
          winner ? 0 : 25,
          false,
          winner ? "Ziggy connects four" : "A full-board draw",
        );
      } else setTurn("you");
    }, 400);
    return () => clearTimeout(timer);
  }, [board, turn, complete, level]);
  function play(col: number) {
    if (turn !== "you") return;
    const next = dropDisc(board, col, 1);
    if (!next) return;
    setBoard(next);
    if (!conclude(next)) setTurn("cpu");
  }
  return (
    <>
      <div className="disc-legend">
        <span>
          <i className="legend-you" />
          You
        </span>
        <span>
          <i className="legend-rival" />
          Ziggy
        </span>
      </div>
      <p className="status" role="status">
        {turn === "cpu"
          ? "Ziggy…"
          : turn === "done"
            ? "Round complete"
            : "Your turn"}
      </p>
      <div className="connect-controls">
        {Array.from({ length: 7 }, (_, col) => (
          <button
            key={col}
            aria-label={`Drop in column ${col + 1}`}
            disabled={turn !== "you" || !!board[col]}
            onClick={() => play(col)}
          >
            ↓
          </button>
        ))}
      </div>
      <div
        className="connect-board"
        role="img"
        aria-label={board
          .map(
            (v, i) =>
              `Row ${Math.floor(i / 7) + 1} column ${(i % 7) + 1}: ${v === 1 ? "you" : v === 2 ? "Ziggy" : "empty"}`,
          )
          .join("; ")}
      >
        {board.map((value, i) => (
          <span key={i} className={`disc disc-${value}`} />
        ))}
      </div>
    </>
  );
}
