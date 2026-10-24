"use client";
import { useGameLook } from "@/components/Personalization";
import { useDifficulty } from "@/components/GameSettings";
import GameResult from "@/components/GameResult";
import { useEffect, useRef, useState } from "react";
import { Directions, Overlay, Toolbar } from "@/components/GameUI";
import {
  useCanvasResolution,
  useFrame,
  useGame,
  useKeys,
} from "@/hooks/useGame";
import { sound } from "@/lib/audio";
import { drawGarden } from "@/lib/gameArt";
type Point = { x: number; y: number };
const vectors = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];
function food(body: Point[]): Point {
  const empty: Point[] = [];
  for (let y = 0; y < 20; y++)
    for (let x = 0; x < 20; x++)
      if (!body.some((p) => p.x === x && p.y === y)) empty.push({ x, y });
  return empty[Math.floor(Math.random() * empty.length)] || { x: -1, y: -1 };
}
export default function Snake() {
  const { palette, surface } = useGameLook("snake");
  const canvas = useRef<HTMLCanvasElement>(null),
    state = useRef({
      body: [
        { x: 7, y: 10 },
        { x: 6, y: 10 },
        { x: 5, y: 10 },
      ],
      food: { x: 14, y: 10 },
      dir: 1,
      next: 1,
      elapsed: 0,
      score: 0,
    }),
    touch = useRef([0, 0]);
  const [phase, setPhase] = useState<"idle" | "playing" | "paused" | "over">(
      "idle",
    ),
    [score, setScore] = useState(0);
  const { difficulty } = useDifficulty();
  const { best, finish, updateBest } = useGame("snake");
  useCanvasResolution(canvas, 440, 440);
  function reset(play = false) {
    const body = [
      { x: 7, y: 10 },
      { x: 6, y: 10 },
      { x: 5, y: 10 },
    ];
    state.current = {
      body,
      food: food(body),
      dir: 1,
      next: 1,
      elapsed: 0,
      score: 0,
    };
    setScore(0);
    setPhase(play ? "playing" : "idle");
    draw();
  }
  function move(d: number) {
    if ((d + 2) % 4 !== state.current.dir) state.current.next = d;
  }
  function draw() {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const s = state.current;
    drawGarden(ctx, s.body, s.food, s.dir, palette, surface);
  }
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    const s = state.current;
    if (ctx) drawGarden(ctx, s.body, s.food, s.dir, palette, surface);
  }, [palette, surface]);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) setPhase((p) => (p === "playing" ? "paused" : p));
    };
    document.addEventListener("visibilitychange", pause);
    return () => document.removeEventListener("visibilitychange", pause);
  }, []);
  useFrame((dt) => {
    const s = state.current;
    s.elapsed += dt;
    if (
      s.elapsed <
      Math.max(
        0.065,
        (difficulty === "easy" ? 0.22 : difficulty === "hard" ? 0.115 : 0.16) -
          s.score / 20000,
      )
    )
      return;
    s.elapsed = 0;
    s.dir = s.next;
    const v = vectors[s.dir],
      head = { x: s.body[0].x + v.x, y: s.body[0].y + v.y },
      eat = head.x === s.food.x && head.y === s.food.y;
    const collision = s.body
      .slice(0, eat ? undefined : -1)
      .some((p) => p.x === head.x && p.y === head.y);
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || collision) {
      setPhase("over");
      finish(s.score);
      sound("lose");
      return;
    }
    s.body.unshift(head);
    if (eat) {
      s.score += 100;
      setScore(s.score);
      updateBest(s.score);
      sound("score");
      if (s.body.length === 400) {
        setPhase("over");
        finish(s.score, true);
      } else s.food = food(s.body);
    } else s.body.pop();
    draw();
  }, phase === "playing");
  useKeys((key) => {
    const keys: Record<string, number> = {
      ArrowUp: 0,
      w: 0,
      ArrowRight: 1,
      d: 1,
      ArrowDown: 2,
      s: 2,
      ArrowLeft: 3,
      a: 3,
    };
    if (key in keys) move(keys[key]);
    if (key === " ")
      setPhase((p) =>
        p === "playing" ? "paused" : p === "paused" ? "playing" : p,
      );
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
        style={{ maxWidth: 440, margin: "auto" }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          touch.current = [e.clientX, e.clientY];
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          const dx = e.clientX - touch.current[0],
            dy = e.clientY - touch.current[1];
          if (Math.max(Math.abs(dx), Math.abs(dy)) > 15)
            move(
              Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : dy > 0 ? 2 : 0,
            );
        }}
      >
        <canvas
          ref={canvas}
          width={440}
          height={440}
          aria-label="Snake game board"
        />
        {(phase === "idle" || phase === "paused") && (
          <Overlay
            title={phase === "paused" ? "Paused" : "Snake"}
            description="Arrows, WASD, or swipe."
            button={phase === "paused" ? "Resume" : "Start Snake"}
            onStart={() =>
              phase === "paused" ? setPhase("playing") : reset(true)
            }
          />
        )}
      </div>
      <Directions onMove={move} />
      {phase === "over" && (
        <GameResult
          title="Game over"
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
