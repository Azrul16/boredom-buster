"use client";
import { useState } from "react";
import MiniGame, { type RoundProps } from "@/games/shared/MiniGame";
import { makeSudoku, sudokuAllowed } from "@/games/shared/puzzles";
import { useKeys } from "@/hooks/useGame";

export default function Game() {
  return <MiniGame slug="mini-sudoku" board={Board} />;
}
function Board({ complete, level }: RoundProps) {
  const [game] = useState(() => makeSudoku([10, 7, 4][level]));
  const [board, setBoard] = useState(game.puzzle);
  const [selected, setSelected] = useState(() => game.puzzle.indexOf(0));
  const [message, setMessage] = useState("Choose a cell.");
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(false);
  function enter(value: number) {
    if (done || selected < 0 || game.puzzle[selected]) return;
    if (value && !sudokuAllowed(board, selected, value)) {
      setMistakes(mistakes + 1);
      setMessage("That number already appears in this row, column, or box.");
      return;
    }
    const next = [...board];
    next[selected] = value;
    setBoard(next);
    setMessage(value ? "" : "Cell cleared.");
    if (
      next.every(Boolean) &&
      next.every((v, i) => sudokuAllowed(next, i, v))
    ) {
      setDone(true);
      complete(Math.max(10, 200 - mistakes * 10), true, "Sudoku solved!");
    }
  }
  useKeys((key) => {
    if (/^[1-4]$/.test(key)) enter(Number(key));
    else if (key === "Backspace" || key === "Delete") enter(0);
  });
  return (
    <>
      <div className="mini-grid sudoku-grid">
        {board.map((value, i) => (
          <button
            key={i}
            className={`${game.puzzle[i] ? "given" : "editable"} ${selected === i ? "selected" : ""}`}
            aria-label={`Row ${Math.floor(i / 4) + 1} column ${(i % 4) + 1}: ${value || "empty"}${game.puzzle[i] ? ", given" : ""}`}
            aria-pressed={selected === i}
            onClick={() => {
              if (!game.puzzle[i]) setSelected(i);
            }}
          >
            {value || "·"}
          </button>
        ))}
      </div>
      <div className="mini-keypad">
        {[1, 2, 3, 4, 0].map((value) => (
          <button
            className="button secondary"
            key={value}
            onClick={() => enter(value)}
          >
            {value || "Erase"}
          </button>
        ))}
      </div>
      <p className="status" role="status">
        {message}
      </p>
    </>
  );
}
