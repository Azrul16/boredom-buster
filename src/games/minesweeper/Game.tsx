"use client";
import { useState } from "react";
import MiniGame, { type RoundProps } from "@/games/shared/MiniGame";
import { makeMines, mineCount, revealMines } from "@/games/shared/puzzles";

export default function Game() {
  return <MiniGame slug="minesweeper" board={Board} />;
}
function Board({ complete, level }: RoundProps) {
  const mineTotal = [8, 10, 14][level],
    safeTotal = 64 - mineTotal;
  const [mines, setMines] = useState<Set<number>>();
  const [open, setOpen] = useState(new Set<number>());
  const [flags, setFlags] = useState(new Set<number>());
  const [flagMode, setFlagMode] = useState(false);
  const [over, setOver] = useState(false);
  function flag(i: number) {
    if (over || open.has(i)) return;
    const next = new Set(flags);
    if (next.has(i)) next.delete(i);
    else if (next.size < mineTotal) next.add(i);
    setFlags(next);
  }
  function reveal(i: number) {
    if (over || open.has(i)) return;
    if (flagMode) {
      flag(i);
      return;
    }
    if (flags.has(i)) return;
    const field = mines ?? makeMines(i, mineTotal);
    if (!mines) setMines(field);
    if (field.has(i)) {
      setOver(true);
      complete(open.size, false, "Watch for the mines!");
      return;
    }
    const next = revealMines(field, open, flags, i);
    setOpen(next);
    if (next.size === safeTotal) {
      setOver(true);
      complete(100, true, "Minefield cleared!");
    }
  }
  return (
    <>
      <div className="mini-metrics">
        <span>
          Safe cells{" "}
          <b>
            {open.size}/{safeTotal}
          </b>
        </span>
        <span>
          Flags{" "}
          <b>
            {flags.size}/{mineTotal}
          </b>
        </span>
      </div>
      <div className="game-options">
        <button
          className="button secondary"
          aria-pressed={flagMode}
          onClick={() => setFlagMode(!flagMode)}
        >
          {flagMode ? "Flag mode on" : "Flag mode off"}
        </button>
      </div>
      <p className="status" role="status">
        {flagMode
          ? "Tap a covered cell to place or remove a flag."
          : "Reveal safe cells. Your first reveal is always safe."}
      </p>
      <div className="mini-grid mine-grid">
        {Array.from({ length: 64 }, (_, i) => {
          const visible = open.has(i),
            bomb = over && mines?.has(i);
          const count = mines && visible ? mineCount(mines, i) : 0;
          return (
            <button
              key={i}
              className={visible ? "revealed" : ""}
              data-count={count}
              aria-label={`Cell ${i + 1}: ${bomb ? "mine" : visible ? `${count} neighboring mines` : flags.has(i) ? "flagged" : "covered"}`}
              aria-disabled={visible || over}
              onClick={() => reveal(i)}
              onContextMenu={(e) => {
                e.preventDefault();
                flag(i);
              }}
            >
              {bomb ? "✹" : flags.has(i) ? "⚑" : visible ? count || "·" : ""}
            </button>
          );
        })}
      </div>
    </>
  );
}
