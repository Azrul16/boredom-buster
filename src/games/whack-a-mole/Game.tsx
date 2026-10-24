"use client";
import { useEffect, useRef, useState } from "react";
import MiniGame, { type RoundProps } from "@/games/shared/MiniGame";
import { sound } from "@/lib/audio";

export default function Game() {
  return <MiniGame slug="whack-a-mole" board={Board} />;
}
function Board({ complete, level }: RoundProps) {
  const target = [10, 15, 25][level],
    interval = [1100, 750, 500][level];
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [remaining, setRemaining] = useState(20);
  const [hole, setHole] = useState(() => Math.floor(Math.random() * 9));
  const [hit, setHit] = useState(false);
  const [score, setScore] = useState(0);
  const seconds = useRef(20),
    hits = useRef(0),
    activeHole = useRef(hole),
    struck = useRef(false);
  const onComplete = useRef(complete);
  useEffect(() => {
    onComplete.current = complete;
  }, [complete]);
  useEffect(() => {
    if (!running) return;
    const clock = setInterval(() => {
      seconds.current--;
      setRemaining(seconds.current);
      if (!seconds.current) {
        setRunning(false);
        onComplete.current(
          hits.current * 10,
          hits.current >= target,
          hits.current >= target ? "Mole master!" : "Time's up!",
        );
      }
    }, 1000);
    const moles = setInterval(() => {
      activeHole.current =
        (activeHole.current + 1 + Math.floor(Math.random() * 8)) % 9;
      struck.current = false;
      setHit(false);
      setHole(activeHole.current);
    }, interval);
    const pause = () => {
      if (document.hidden) setRunning(false);
    };
    document.addEventListener("visibilitychange", pause);
    window.addEventListener("blur", pauseOnBlur);
    window.addEventListener("boredom-customize", pauseOnBlur);
    function pauseOnBlur() {
      setRunning(false);
    }
    return () => {
      clearInterval(clock);
      clearInterval(moles);
      document.removeEventListener("visibilitychange", pause);
      window.removeEventListener("blur", pauseOnBlur);
      window.removeEventListener("boredom-customize", pauseOnBlur);
    };
  }, [running, interval, target]);
  function whack(index: number) {
    if (!running || index !== activeHole.current || struck.current) return;
    struck.current = true;
    setHit(true);
    hits.current++;
    setScore(hits.current * 10);
    sound("score");
  }
  return (
    <>
      <div className="mini-metrics">
        <span>
          Time <b>{remaining}s</b>
        </span>
        <span>
          Score <b>{score}</b>
        </span>
      </div>
      <div className="mini-grid mole-grid">
        {Array.from({ length: 9 }, (_, index) => (
          <button
            key={index}
            className={
              running && hole === index && !hit ? "mole-up" : "mole-hole"
            }
            aria-label={
              running && hole === index && !hit
                ? `Whack mole ${index + 1}`
                : `Empty hole ${index + 1}`
            }
            disabled={!running || remaining === 0}
            onClick={() => whack(index)}
          >
            <span aria-hidden="true">
              {running && hole === index ? (hit ? "✦" : "🐹") : "·"}
            </span>
          </button>
        ))}
      </div>
      <div className="game-options">
        <button
          className="button"
          disabled={!remaining}
          onClick={() => {
            setStarted(true);
            setRunning(!running);
          }}
        >
          {running ? "Pause" : started ? "Resume" : "Start game"}
        </button>
      </div>
      <p className="status" role="status">
        {running
          ? `${target} hits to win`
          : started
            ? "Paused"
            : `${target} hits to win`}
      </p>
    </>
  );
}
