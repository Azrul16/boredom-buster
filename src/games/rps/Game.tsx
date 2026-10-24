"use client";
import GameResult from "@/components/GameResult";
import { useEffect, useRef, useState } from "react";
import { Toolbar } from "@/components/GameUI";
import { useGame } from "@/hooks/useGame";
import { sound } from "@/lib/audio";
import { Gesture } from "@/components/Gestures";
const choices = [
    <Gesture key="rock" choice={0} />,
    <Gesture key="paper" choice={1} />,
    <Gesture key="scissors" choice={2} />,
  ],
  names = ["Rock", "Paper", "Scissors"];
export default function RPS() {
  const [score, setScore] = useState([0, 0]),
    [pick, setPick] = useState<number | null>(null),
    [cpu, setCpu] = useState<number | null>(null),
    [busy, setBusy] = useState(false),
    [result, setResult] = useState("Your move. Make it count.");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { finish } = useGame("rock-paper-scissors");
  const over = score.some((s) => s === 3);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function reset() {
    if (timer.current) clearTimeout(timer.current);
    setScore([0, 0]);
    setPick(null);
    setCpu(null);
    setBusy(false);
    setResult("Your move. Make it count.");
  }
  function play(i: number) {
    if (busy || over) return;
    setPick(i);
    setCpu(null);
    setBusy(true);
    setResult("Rock… Paper… Scissors…");
    timer.current = setTimeout(() => {
      const c = Math.floor(Math.random() * 3),
        win = (i - c + 3) % 3 === 1,
        draw = i === c;
      setCpu(c);
      setBusy(false);
      if (draw) {
        setResult("A draw. Great minds think alike.");
        return;
      }
      const next = [score[0] + Number(win), score[1] + Number(!win)];
      setScore(next);
      setResult(
        next.some((s) => s === 3)
          ? next[0] === 3
            ? "You take the match!"
            : "CPU takes the match. Rematch?"
          : win
            ? "You win this round!"
            : "CPU wins this round.",
      );
      sound(win ? "score" : "lose");
      if (next.some((s) => s === 3)) finish(next[0], next[0] === 3);
    }, 650);
  }
  return (
    <>
      <Toolbar
        stats={[
          ["You", score[0]],
          ["CPU", score[1]],
          ["Match", "First to 3"],
        ]}
        onRestart={reset}
      />
      <div className={`rps-reveal ${busy ? "revealing" : ""}`}>
        <span data-label="YOU">
          {pick === null ? choices[0] : choices[pick]}
        </span>
        <small>VS</small>
        <span data-label="CPU">{cpu === null ? choices[0] : choices[cpu]}</span>
      </div>
      <div className="round-pips" aria-label="Match wins">
        <div>
          {Array.from({ length: 3 }, (_, i) => (
            <i className={i < score[0] ? "earned" : ""} key={i} />
          ))}
        </div>
        <div>
          {Array.from({ length: 3 }, (_, i) => (
            <i className={i < score[1] ? "earned" : ""} key={i} />
          ))}
        </div>
      </div>
      <p className="status" role="status">
        {result}
      </p>
      <div className="rps-options">
        {names.map((name, i) => (
          <button key={name} disabled={busy || over} onClick={() => play(i)}>
            <span>{choices[i]}</span>
            {name}
          </button>
        ))}
      </div>
      {over && (
        <GameResult
          title={score[0] === 3 ? "You won the match!" : "CPU wins the match"}
          stats={[
            ["You", score[0]],
            ["CPU", score[1]],
          ]}
          celebrate={score[0] === 3}
          highlight={score[0] === 3 ? 0 : 1}
          onContinue={reset}
        />
      )}
    </>
  );
}
