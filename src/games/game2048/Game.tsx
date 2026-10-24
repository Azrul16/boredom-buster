"use client";
import GameResult from "@/components/GameResult";
import { useDifficulty } from "@/components/GameSettings";
import { useEffect, useRef, useState } from "react";
import { movementTargets } from "./motion";
import { Toolbar, Directions } from "@/components/GameUI";
import { useGame, useKeys } from "@/hooks/useGame";
import { canMove, slide, spawn } from "./logic";
import { sound } from "@/lib/audio";
export default function Game2048() {
  const { level } = useDifficulty();
  const fourChance = [0.05, 0.1, 0.25][level];
  const [board, setBoard] = useState(() =>
      spawn(spawn(Array<number>(16).fill(0), fourChance), fourChance),
    ),
    [score, setScore] = useState(0),
    [won, setWon] = useState(false),
    [over, setOver] = useState(false);
  const touch = useRef([0, 0]);
  const reported = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [targets, setTargets] = useState<Record<number, number> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const { best, finish, updateBest } = useGame("2048");
  function reset() {
    if (timer.current) clearTimeout(timer.current);
    setTargets(null);
    setBoard(spawn(spawn(Array<number>(16).fill(0), fourChance), fourChance));
    setScore(0);
    setWon(false);
    setOver(false);
    reported.current = false;
  }
  function move(d: number) {
    if (over || won || targets) return;
    const result = slide(board, d);
    if (!result.changed) return;
    const next = spawn(result.board, fourChance),
      points = score + result.score,
      max = Math.max(...next),
      dead = !canMove(next);
    setTargets(movementTargets(board, d));
    timer.current = setTimeout(() => {
      setBoard(next);
      setTargets(null);
    }, 140);
    setScore(points);
    updateBest(points);
    if (result.score) sound("score");
    if (max >= 2048 && !won) {
      setWon(true);
      finish(points, true, { tile: max });
      reported.current = true;
      sound("win");
    }
    if (dead) {
      setOver(true);
      if (!reported.current) finish(points, max >= 2048, { tile: max });
      sound("lose");
    }
  }
  useKeys((key) => {
    const d: Record<string, number> = {
      ArrowUp: 0,
      w: 0,
      ArrowRight: 1,
      d: 1,
      ArrowDown: 2,
      s: 2,
      ArrowLeft: 3,
      a: 3,
    };
    if (key in d) move(d[key]);
  });
  return (
    <>
      <Toolbar
        stats={[
          ["Score", score],
          ["Best", Math.max(best || 0, score)],
        ]}
        onRestart={reset}
      />
      <div
        className="board-2048"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          touch.current = [e.clientX, e.clientY];
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          const dx = e.clientX - touch.current[0],
            dy = e.clientY - touch.current[1];
          if (Math.max(Math.abs(dx), Math.abs(dy)) > 20)
            move(
              Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : dy > 0 ? 2 : 0,
            );
        }}
      >
        <div className="tile-field">
          <div className="tile-background" aria-hidden="true">
            {Array.from({ length: 16 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          {board.map((value, i) =>
            value ? (
              <div
                className="tile"
                data-value={value}
                key={i}
                aria-label={value ? `${value}` : "Empty"}
                style={{
                  left: `calc(${((targets?.[i] ?? i) % 4) * 25}% + ${((targets?.[i] ?? i) % 4) * 2.25}px)`,
                  top: `calc(${Math.floor((targets?.[i] ?? i) / 4) * 25}% + ${Math.floor((targets?.[i] ?? i) / 4) * 2.25}px)`,
                }}
              >
                {value || ""}
              </div>
            ) : null,
          )}
        </div>
      </div>
      <p className="status" role="status">
        {over
          ? "No moves left. A fresh board awaits."
          : won
            ? "2048 reached!"
            : "Slide. Merge. Repeat."}
      </p>
      <Directions onMove={move} />
      {(over || won) && (
        <GameResult
          title={won ? "2048 reached!" : "Game over"}
          stats={[
            ["Score", score],
            ["Best", Math.max(best || 0, score)],
          ]}
          celebrate={won}
          onContinue={reset}
        />
      )}
    </>
  );
}
