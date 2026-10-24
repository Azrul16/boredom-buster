"use client";
import { useGameLook } from "@/components/Personalization";
import { useDifficulty } from "@/components/GameSettings";
import GameResult from "@/components/GameResult";
import { useEffect, useRef, useState } from "react";
import { Overlay, Toolbar } from "@/components/GameUI";
import { useCanvasResolution, useFrame, useGame } from "@/hooks/useGame";
import { sound } from "@/lib/audio";
import { drawPong } from "@/lib/gameArt";
const W = 680,
  H = 420,
  PH = 80;
function initial() {
  return {
    x: W / 2,
    y: H / 2,
    vx: 260 * (Math.random() > 0.5 ? 1 : -1),
    vy: 130,
    player: H / 2,
    cpu: H / 2,
    score: [0, 0],
    trail: [] as { x: number; y: number }[],
  };
}
export default function Pong() {
  const { palette, surface } = useGameLook("pong");
  const canvas = useRef<HTMLCanvasElement>(null),
    state = useRef(initial()),
    keys = useRef(new Set<string>());
  const [phase, setPhase] = useState<"idle" | "playing" | "paused" | "over">(
      "idle",
    ),
    [scores, setScores] = useState([0, 0]);
  const { difficulty } = useDifficulty();
  const { finish } = useGame("pong");
  useCanvasResolution(canvas, W, H);
  function reset(start = false) {
    state.current = initial();
    setScores([0, 0]);
    setPhase(start ? "playing" : "idle");
  }
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).matches("input,select,a")) return;
        if (["ArrowUp", "ArrowDown", "w", "s"].includes(e.key)) {
          e.preventDefault();
          keys.current.add(e.key);
        }
      },
      up = (e: KeyboardEvent) => keys.current.delete(e.key),
      blur = () => {
        keys.current.clear();
        setPhase((p) => (p === "playing" ? "paused" : p));
      };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);
  useFrame((dt) => {
    const s = state.current,
      ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    if (phase === "playing") {
      if (keys.current.has("w") || keys.current.has("ArrowUp"))
        s.player -= 380 * dt;
      if (keys.current.has("s") || keys.current.has("ArrowDown"))
        s.player += 380 * dt;
      s.player = Math.max(PH / 2, Math.min(H - PH / 2, s.player));
      const target = s.vx > 0 ? s.y : H / 2;
      s.cpu +=
        Math.sign(target - s.cpu) *
        Math.min(
          Math.abs(target - s.cpu),
          (difficulty === "easy" ? 155 : difficulty === "hard" ? 285 : 205) *
            dt,
        );
      s.cpu = Math.max(PH / 2, Math.min(H - PH / 2, s.cpu));
      s.trail.push({ x: s.x, y: s.y });
      if (s.trail.length > 12) s.trail.shift();
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (s.y < 9 || s.y > H - 9) {
        s.y = Math.max(9, Math.min(H - 9, s.y));
        s.vy *= -1;
      }
      if (
        s.vx < 0 &&
        s.x < 37 &&
        s.x > 14 &&
        Math.abs(s.y - s.player) < PH / 2 + 8
      ) {
        s.x = 38;
        s.vx = Math.min(560, Math.abs(s.vx) * 1.055);
        s.vy = (s.y - s.player) * 7;
        sound("score");
      }
      if (
        s.vx > 0 &&
        s.x > W - 37 &&
        s.x < W - 14 &&
        Math.abs(s.y - s.cpu) < PH / 2 + 8
      ) {
        s.x = W - 38;
        s.vx = -Math.min(560, Math.abs(s.vx) * 1.055);
        s.vy = (s.y - s.cpu) * 7;
      }
      if (s.x < 0 || s.x > W) {
        const serveDirection = s.x > W ? -1 : 1;
        s.score[s.x > W ? 0 : 1]++;
        setScores([...s.score]);
        if (s.score.some((n) => n === 7)) {
          setPhase("over");
          finish(s.score[0], s.score[0] === 7);
          sound(s.score[0] === 7 ? "win" : "lose");
        }
        s.trail = [];
        s.x = W / 2;
        s.y = H / 2;
        s.vx = 260 * serveDirection;
        s.vy = 100 * (Math.random() > 0.5 ? 1 : -1);
      }
    }
    drawPong(ctx, s, palette, surface);
  });
  function drag(e: React.PointerEvent<HTMLDivElement>) {
    if (phase !== "playing") return;
    const rect = e.currentTarget.getBoundingClientRect();
    state.current.player = Math.max(
      PH / 2,
      Math.min(H - PH / 2, ((e.clientY - rect.top) / rect.height) * H),
    );
  }
  return (
    <>
      <Toolbar
        stats={[
          ["You", scores[0]],
          ["Ziggy", scores[1]],
          ["Goal", 7],
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
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag(e);
        }}
        onPointerMove={(e) => {
          if (e.pointerType === "mouse" || e.buttons) drag(e);
        }}
      >
        <canvas ref={canvas} width={W} height={H} aria-label="Pong court" />
        {(phase === "idle" || phase === "paused") && (
          <Overlay
            title={phase === "paused" ? "Paused" : "Mini Pong"}
            description="Move your paddle. First to seven."
            button={phase === "paused" ? "Resume" : "Start Pong"}
            onStart={() =>
              phase === "paused" ? setPhase("playing") : reset(true)
            }
          />
        )}
      </div>
      <p className="status">W / S · ↑ / ↓ · Move your mouse or drag to play</p>
      {phase === "over" && (
        <GameResult
          title={scores[0] === 7 ? "You win!" : "Ziggy wins"}
          stats={[
            ["You", scores[0]],
            ["Ziggy", scores[1]],
          ]}
          celebrate={scores[0] === 7}
          highlight={scores[0] === 7 ? 0 : 1}
          onContinue={() => reset(true)}
        />
      )}
    </>
  );
}
