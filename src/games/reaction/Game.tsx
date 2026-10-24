"use client";
import GameResult from "@/components/GameResult";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Toolbar } from "@/components/GameUI";
import { useGame, useKeys } from "@/hooks/useGame";
import { sound } from "@/lib/audio";
export default function Reaction() {
  const [phase, setPhase] = useState<
      "idle" | "wait" | "go" | "early" | "result"
    >("idle"),
    [attempts, setAttempts] = useState<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    start = useRef(0);
  const { best, finish } = useGame("reaction-time");
  useLayoutEffect(() => {
    if (phase === "go") start.current = performance.now();
  }, [phase]);
  function reset() {
    if (timer.current) clearTimeout(timer.current);
    setPhase("idle");
  }
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function tap() {
    if (phase === "wait") {
      if (timer.current) clearTimeout(timer.current);
      setPhase("early");
      sound("lose");
    } else if (phase === "go") {
      const result = Math.round(performance.now() - start.current);
      setAttempts((a) => [...a.slice(-4), result]);
      finish(result);
      setPhase("result");
      sound("score");
    } else {
      setPhase("wait");
      timer.current = setTimeout(
        () => {
          start.current = performance.now();
          setPhase("go");
        },
        1500 + Math.random() * 3500,
      );
    }
  }
  useKeys((key) => {
    if (key === " ") tap();
  });
  const latest = attempts.at(-1),
    rating = !latest
      ? ""
      : latest < 180
        ? "Lightning Fast"
        : latest < 220
          ? "Excellent"
          : latest < 280
            ? "Good"
            : latest < 350
              ? "Average"
              : "Keep practicing";
  return (
    <>
      <Toolbar
        stats={[
          ["Best", best ? `${best} ms` : "—"],
          [
            "Last 5 avg",
            attempts.length
              ? `${Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)} ms`
              : "—",
          ],
        ]}
        onRestart={reset}
      />
      <button
        className={`reaction-zone ${phase}`}
        onPointerDown={(e) => {
          if (e.button === 0) {
            e.preventDefault();
            tap();
          }
        }}
        onClick={(e) => {
          if (e.detail === 0) tap();
        }}
      >
        <span>{phase === "go" ? "ϟ" : phase === "early" ? "!" : "◉"}</span>
        <strong>
          {phase === "idle"
            ? "Click Start"
            : phase === "wait"
              ? "Wait for green…"
              : phase === "go"
                ? "GO! TAP NOW"
                : phase === "early"
                  ? "Too soon!"
                  : `${latest} ms`}
        </strong>
        <small>
          {phase === "result"
            ? `${rating} · Tap to try again`
            : phase === "early"
              ? "Tap to try again"
              : phase === "idle"
                ? "Tap here or press Space"
                : phase === "wait"
                  ? "Patience is part of the game."
                  : "Go, go, go!"}
        </small>
      </button>
      <div className="reaction-history" aria-label="Last five reaction times">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={attempts[i] ? "recorded" : ""}>
            <span>{i + 1}</span>
            <strong>{attempts[i] ? `${attempts[i]} ms` : "—"}</strong>
          </div>
        ))}
      </div>
      <p className="status" aria-live="polite">
        {phase === "result"
          ? `Latest: ${latest} ms · ${rating}`
          : "How fast is your fast?"}
      </p>
      {(phase === "result" || phase === "early") && (
        <GameResult
          title={phase === "early" ? "Too soon!" : rating}
          stats={
            phase === "early"
              ? [["Attempt", "False start"]]
              : [
                  ["Reaction", (latest ?? 0) + " ms"],
                  ["Best", (best ?? latest ?? 0) + " ms"],
                ]
          }
          celebrate={phase === "result" && (latest ?? 999) < 280}
          onContinue={tap}
        />
      )}
    </>
  );
}
