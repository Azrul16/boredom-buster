"use client";
import GameResult from "@/components/GameResult";
import { useDifficulty } from "@/components/GameSettings";
import { useEffect, useRef, useState } from "react";
import { Toolbar } from "@/components/GameUI";
import { useGame } from "@/hooks/useGame";
import { sound } from "@/lib/audio";
const icons = ["🍋", "⚡", "🚀", "🎲", "🌙", "💎", "🌵", "🎧"];
function shuffle(pairs = 8) {
  const choices = [...icons, "🌈", "🎯"].slice(0, pairs);
  const a = [...choices, ...choices];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export default function Memory() {
  const { level } = useDifficulty();
  const pairs = [6, 8, 10][level];
  const [cards, setCards] = useState(() => shuffle(pairs)),
    [open, setOpen] = useState<number[]>([]),
    [matched, setMatched] = useState<number[]>([]),
    [moves, setMoves] = useState(0),
    [seconds, setSeconds] = useState(0),
    [started, setStarted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { best, finish } = useGame("memory-match");
  const done = matched.length === pairs * 2;
  useEffect(() => {
    if (!started || done) return;
    const id = setInterval(() => {
      if (document.documentElement.dataset.customizing !== "true")
        setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [started, done]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function reset() {
    if (timer.current) clearTimeout(timer.current);
    setCards(shuffle(pairs));
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
    setStarted(false);
  }
  function flip(i: number) {
    if (done || open.length === 2 || open.includes(i) || matched.includes(i))
      return;
    setStarted(true);
    sound();
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      if (cards[next[0]] === cards[next[1]]) {
        const found = [...matched, ...next];
        setMatched(found);
        setOpen([]);
        sound("score");
        if (found.length === pairs * 2) {
          finish(moves + 1, true);
          sound("win");
        }
      } else
        timer.current = setTimeout(() => setOpen([]), [1200, 800, 450][level]);
    }
  }
  return (
    <>
      <Toolbar
        stats={[
          ["Moves", moves],
          [
            "Time",
            `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`,
          ],
          ["Best", best ?? "—"],
        ]}
        onRestart={reset}
      />
      <div className="memory-grid">
        {cards.map((card, i) => {
          const show = open.includes(i) || matched.includes(i);
          return (
            <button
              key={i}
              aria-label={
                show
                  ? `${card}${matched.includes(i) ? ", matched" : ""}`
                  : `Reveal card ${i + 1}`
              }
              className={`${show ? "revealed" : ""} ${matched.includes(i) ? "matched" : ""}`}
              onClick={() => flip(i)}
            >
              <span className="memory-card-inner">
                <span className="memory-card-back" aria-hidden="true">
                  ✦
                </span>
                <span className="memory-card-face">{show ? card : ""}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="status" role="status">
        {done
          ? `All matched in ${moves} moves. Nicely done!`
          : `${matched.length / 2} / ${pairs} pairs found`}
      </p>
      {done && (
        <GameResult
          title="All pairs matched!"
          stats={[
            ["Moves", moves],
            ["Time", seconds + "s"],
          ]}
          celebrate
          onContinue={reset}
        />
      )}
    </>
  );
}
