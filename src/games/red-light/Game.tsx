"use client";
import GameResult from "@/components/GameResult";
import { useDifficulty } from "@/components/GameSettings";
import { useEffect, useRef, useState } from "react";
import { Overlay, Toolbar } from "@/components/GameUI";
import { useCanvasResolution, useFrame, useGame } from "@/hooks/useGame";
import { sound } from "@/lib/audio";
import { drawRace } from "@/lib/gameArt";
import { useGameLook } from "@/components/Personalization";
type Signal = "green" | "amber" | "red";
export default function RedLight() {
  const { palette } = useGameLook("red-light-green-light");
  const { level } = useDifficulty();
  const canvas = useRef<HTMLCanvasElement>(null),
    state = useRef({
      progress: 0,
      signal: "green" as Signal,
      remaining: 2,
      held: false,
      time: 0,
    });
  const [phase, setPhase] = useState<
      "idle" | "playing" | "paused" | "over" | "won"
    >("idle"),
    [signal, setSignal] = useState<Signal>("green"),
    [progress, setProgress] = useState(0),
    [portrait, setPortrait] = useState(false);
  const { best, finish } = useGame("red-light-green-light");
  useCanvasResolution(canvas, portrait ? 380 : 680, portrait ? 520 : 380);
  useEffect(() => {
    const media = matchMedia("(max-width:600px)");
    const update = () => setPortrait(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  function reset(start = false) {
    state.current = {
      progress: 0,
      signal: "green",
      remaining: 1.5 + Math.random(),
      held: false,
      time: 0,
    };
    setSignal("green");
    setProgress(0);
    setPhase(start ? "playing" : "idle");
  }
  function hold(value: boolean) {
    state.current.held = value;
  }
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).matches("button,input,a")) return;
        if (e.code === "Space") {
          e.preventDefault();
          hold(true);
        }
      },
      up = (e: KeyboardEvent) => {
        if (e.code === "Space") hold(false);
      },
      blur = () => {
        hold(false);
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
      s.time += dt;
      s.remaining -= dt;
      if (s.remaining <= 0) {
        s.signal =
          s.signal === "green"
            ? "amber"
            : s.signal === "amber"
              ? "red"
              : "green";
        s.remaining =
          s.signal === "amber"
            ? Math.max(
                [0.55, 0.32, 0.2][level],
                [0.9, 0.65, 0.4][level] - s.progress * 0.003,
              )
            : s.signal === "green"
              ? Math.max(0.65, 1.5 + Math.random() * 1.3 - s.progress * 0.007)
              : 1 + Math.random() * 1.5;
        setSignal(s.signal);
        sound();
      }
      if (s.held) {
        if (s.signal === "red") {
          setPhase("over");
          finish(Math.floor(s.progress));
          sound("lose");
          s.held = false;
        } else {
          s.progress = Math.min(100, s.progress + dt * [16, 14, 12][level]);
          setProgress(Math.floor(s.progress));
          if (s.progress >= 100) {
            setPhase("won");
            finish(Math.round(10000 / s.time), true);
            sound("win");
            s.held = false;
          }
        }
      }
    }
    drawRace(ctx, s, portrait, palette);
  });
  return (
    <>
      <Toolbar
        stats={[
          ["Progress", `${progress}%`],
          ["Best", best ?? "—"],
        ]}
        onRestart={() => reset()}
        paused={phase === "paused"}
        onPause={() => {
          hold(false);
          setPhase((p) =>
            p === "playing" ? "paused" : p === "paused" ? "playing" : p,
          );
        }}
      />
      <div className="canvas-wrap">
        <canvas
          ref={canvas}
          width={portrait ? 380 : 680}
          height={portrait ? 520 : 380}
          aria-label="Red Light Green Light race track"
        />
        {(phase === "idle" || phase === "paused") && (
          <Overlay
            title={phase === "paused" ? "Paused" : "Red Light, Green Light"}
            description="Hold to move. Stop on red."
            button={phase === "paused" ? "Resume" : "Start race"}
            onStart={() =>
              phase === "paused" ? setPhase("playing") : reset(true)
            }
          />
        )}
      </div>
      <p
        className="status"
        role="status"
        style={{
          color:
            signal === "green"
              ? "var(--green)"
              : signal === "red"
                ? "var(--coral)"
                : "#ddbd6f",
        }}
      >
        {phase === "playing"
          ? signal === "green"
            ? "GREEN LIGHT · GO"
            : signal === "amber"
              ? "AMBER · RELEASE NOW"
              : "RED LIGHT · FREEZE"
          : "Watch the lights. Time your move."}
      </p>
      <button
        className="button hold-button"
        disabled={phase !== "playing"}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          hold(true);
        }}
        onPointerUp={() => hold(false)}
        onPointerCancel={() => hold(false)}
        onLostPointerCapture={() => hold(false)}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            hold(true);
          }
        }}
        onKeyUp={() => hold(false)}
        onBlur={() => hold(false)}
      >
        HOLD TO MOVE · RELEASE TO STOP
      </button>
      {(phase === "over" || phase === "won") && (
        <GameResult
          title={phase === "won" ? "Race won!" : "Caught moving!"}
          stats={[["Progress", progress + "%"]]}
          celebrate={phase === "won"}
          onContinue={() => reset(true)}
        />
      )}
    </>
  );
}
