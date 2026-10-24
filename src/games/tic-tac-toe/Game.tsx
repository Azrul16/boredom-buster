"use client";
import GameResult from "@/components/GameResult";
import { useEffect, useState } from "react";
import { bestMove, winner, Mark } from "./logic";
import { Toolbar } from "@/components/GameUI";
import { useGame } from "@/hooks/useGame";
import { sound } from "@/lib/audio";
export default function TicTacToe() {
  const [board, setBoard] = useState<Mark[]>(Array(9).fill(null)),
    [turn, setTurn] = useState<Mark>("X"),
    [mode, setMode] = useState("cpu"),
    [difficulty, setDifficulty] = useState("hard"),
    [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });
  const { finish } = useGame("tic-tac-toe");
  const line = winner(board),
    done = !!line || board.every(Boolean);
  function reset() {
    setBoard(Array(9).fill(null));
    setTurn("X");
  }
  function play(i: number) {
    if (board[i] || done || (mode === "cpu" && turn === "O")) return;
    const next = [...board];
    next[i] = turn;
    setBoard(next);
    setTurn(turn === "X" ? "O" : "X");
    sound();
  }
  useEffect(() => {
    if (done) {
      const win = line ? board[line[0]] : null;
      setScores((s) => ({ ...s, [win || "draw"]: s[win || "draw"] + 1 }));
      finish(win === "X" ? 1 : 0, win === "X");
      sound(win === "X" ? "win" : "lose");
    }
  }, [done, board, line, finish]);
  useEffect(() => {
    if (mode !== "cpu" || turn !== "O" || done) return;
    const timer = setTimeout(() => {
      const choices = board.flatMap((v, i) => (v ? [] : [i]));
      const i =
        difficulty === "hard"
          ? bestMove(board)
          : choices[Math.floor(Math.random() * choices.length)];
      setBoard((b) => b.map((v, j) => (i === j ? "O" : v)));
      setTurn("X");
    }, 350);
    return () => clearTimeout(timer);
  }, [board, turn, mode, difficulty, done]);
  return (
    <>
      <Toolbar
        stats={[["Mode", mode === "cpu" ? "vs CPU" : "2 players"]]}
        onRestart={reset}
      />
      <div className="game-options">
        <select
          aria-label="Opponent"
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
            reset();
          }}
        >
          <option value="cpu">Player vs Computer</option>
          <option value="local">Local 2 Player</option>
        </select>
        {mode === "cpu" && (
          <select
            aria-label="Computer difficulty"
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              reset();
            }}
          >
            <option value="easy">Easy</option>
            <option value="hard">Hard · Unbeatable</option>
          </select>
        )}
      </div>
      <div className="ttt">
        {board.map((mark, i) => (
          <button
            key={i}
            aria-label={`Row ${Math.floor(i / 3) + 1} column ${(i % 3) + 1}${mark ? `, ${mark}` : ""}`}
            onClick={() => play(i)}
            className={`${mark === "O" ? "mark-o" : ""} ${line?.includes(i) ? "winning" : ""}`}
          >
            {mark && (
              <svg className="draw-mark" viewBox="0 0 80 80" aria-hidden="true">
                {mark === "X" ? (
                  <path d="M22 22 58 58 M58 22 22 58" />
                ) : (
                  <circle cx="40" cy="40" r="24" />
                )}
              </svg>
            )}
          </button>
        ))}
        {line && (
          <svg
            className="winning-line"
            viewBox="0 0 300 300"
            aria-hidden="true"
          >
            <line
              x1={(line[0] % 3) * 100 + 50}
              y1={Math.floor(line[0] / 3) * 100 + 50}
              x2={(line[2] % 3) * 100 + 50}
              y2={Math.floor(line[2] / 3) * 100 + 50}
            />
          </svg>
        )}
      </div>
      <p className="status" role="status">
        {line
          ? `${board[line[0]]} wins!`
          : done
            ? "A well-played draw."
            : `${turn}’s turn${turn === "O" && mode === "cpu" ? " · Thinking…" : ""}`}
      </p>
      <div className="score-row">
        <span>
          X wins<b>{scores.X}</b>
        </span>
        <span>
          Draws<b>{scores.draw}</b>
        </span>
        <span>
          O wins<b>{scores.O}</b>
        </span>
      </div>
      <div className="game-options">
        <button className="button" onClick={reset}>
          New Game
        </button>
        <button
          className="button secondary"
          onClick={() => {
            setScores({ X: 0, O: 0, draw: 0 });
            reset();
          }}
        >
          Reset Score
        </button>
      </div>
      {done && (
        <GameResult
          title={line ? board[line[0]] + " wins!" : "Draw"}
          stats={[
            ["X", scores.X],
            ["Draws", scores.draw],
            ["O", scores.O],
          ]}
          celebrate={!!line && (mode === "local" || board[line[0]] === "X")}
          highlight={line ? (board[line[0]] === "X" ? 0 : 2) : undefined}
          onContinue={reset}
          eyebrow="ROUND COMPLETE"
        />
      )}
    </>
  );
}
