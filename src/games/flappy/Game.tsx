"use client";
import GameResult from "@/components/GameResult";
import { useEffect, useRef, useState } from "react";
import { Overlay, Toolbar } from "@/components/GameUI";
import {
  useCanvasResolution,
  useFrame,
  useGame,
  useKeys,
} from "@/hooks/useGame";
import { sound } from "@/lib/audio";
import { drawFlight } from "@/lib/gameArt";
const W = 480,
  H = 500,
  X = 105;
type Gate = { x: number; center: number; passed: boolean; gap: number };
function initial() {
  return { y: 250, vy: 0, gates: [] as Gate[], spawn: 0, score: 0, time: 0 };
}
export default function Flappy() {
  const canvas = useRef<HTMLCanvasElement>(null),
    state = useRef(initial());
  const [phase, setPhase] = useState<"idle" | "playing" | "paused" | "over">(
      "idle",
    ),
    [score, setScore] = useState(0);
  const { best, finish, updateBest } = useGame("flappy");
  useCanvasResolution(canvas, W, H);
  function reset(play = false) {
    state.current = initial();
    if (play) state.current.vy = -220;
    setScore(0);
    setPhase(play ? "playing" : "idle");
  }
  function jump() {
    if (phase === "playing") {
      state.current.vy = -290;
      sound();
    }
  }
  useKeys((key) => {
    if (key === " ") {
      if (phase === "idle" || phase === "over") reset(true);
      else jump();
    }
  });
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) setPhase((p) => (p === "playing" ? "paused" : p));
    };
    document.addEventListener("visibilitychange", hidden);
    return () => document.removeEventListener("visibilitychange", hidden);
  }, []);
  useFrame((dt) => {
    const s = state.current,
      ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const gap = Math.max(128, 175 - s.score * 2),
      speed = 145 + Math.min(s.score * 3, 65);
    if (phase === "playing") {
      s.time += dt;
      s.vy += 820 * dt;
      s.y += s.vy * dt;
      s.spawn -= dt;
      if (s.spawn <= 0) {
        s.gates.push({
          x: W + 30,
          center: Math.max(
            105,
            Math.min(
              H - 105,
              (s.gates.at(-1)?.center ?? H / 2) + (Math.random() - 0.5) * 150,
            ),
          ),
          gap,
          passed: false,
        });
        s.spawn = 1.65;
      }
      s.gates = s.gates.map((gate) => {
        const x = gate.x - speed * dt;
        const passed = gate.passed || x + 46 < X - 13;
        if (passed && !gate.passed) {
          s.score++;
          setScore(s.score);
          updateBest(s.score);
          sound("score");
        }
        return { ...gate, x, passed };
      });
      s.gates = s.gates.filter((g) => g.x > -60);
      const collision = s.gates.some(
        (g) =>
          X + 13 > g.x &&
          X - 13 < g.x + 46 &&
          (s.y - 11 < g.center - g.gap / 2 || s.y + 11 > g.center + g.gap / 2),
      );
      if (s.y < 13 || s.y > H - 13 || collision) {
        setPhase("over");
        finish(s.score);
        sound("lose");
      }
    }
    drawFlight(ctx, s);
  });
  return (
    <>
      <Toolbar
        stats={[
          ["Score", score],
          ["Best", Math.max(best || 0, score)],
        ]}
        onRestart={() => reset()}
        paused={phase === "paused"}
        onPause={() =>
          setPhase((p) =>
            p === "playing" ? "paused" : p === "paused" ? "playing" : p,
          )
        }
      />
      <div
        className="canvas-wrap"
        style={{ maxWidth: 480, margin: "auto" }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).tagName !== "BUTTON") jump();
        }}
      >
        <canvas
          ref={canvas}
          width={W}
          height={H}
          aria-label="Geometric flyer obstacle course"
        />
        {(phase === "idle" || phase === "paused") && (
          <Overlay
            title={phase === "paused" ? "Paused" : "Flappy"}
            description="Tap or press Space to fly."
            button={phase === "paused" ? "Resume" : "Start flying"}
            onStart={() =>
              phase === "paused" ? setPhase("playing") : reset(true)
            }
          />
        )}
      </div>
      {phase === "over" && (
        <GameResult
          title="Flight complete"
          stats={[
            ["Score", score],
            ["Best", Math.max(best || 0, score)],
          ]}
          celebrate={score > 0 && score >= (best || 0)}
          onContinue={() => reset(true)}
        />
      )}
    </>
  );
}
