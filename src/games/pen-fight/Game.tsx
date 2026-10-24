"use client";
import { useEffect, useRef, useState } from "react";
import { Body, Composite, Engine, Vector, Events } from "matter-js";
import {
  createDesk,
  flickPen,
  stepPhysics,
  penAnchor,
  pullShot,
} from "./physics";
import type { Point } from "./physics";
import { Toolbar } from "@/components/GameUI";
import ResultPopup from "./ResultPopup";
import { useCanvasResolution, useFrame, useGame } from "@/hooks/useGame";
import { sound } from "@/lib/audio";
import { useGameLook } from "@/components/Personalization";
import { useDifficulty } from "@/components/GameSettings";
type World = {
  engine: Engine;
  pens: Body[];
  moving: boolean;
  turn: "player" | "cpu";
  elapsed: number;
  quiet: number;
  cpuDelay: number;
  accumulator: number;
};
const W = 680,
  H = 420,
  edge = 32;
export default function PenFight() {
  const { palette, surface } = useGameLook("pen-fight");
  const colorName = useRef(palette?.name.toLowerCase() ?? "purple");
  useEffect(() => {
    colorName.current = palette?.name.toLowerCase() ?? "purple";
  }, [palette]);
  const { level } = useDifficulty();
  const canvas = useRef<HTMLCanvasElement>(null),
    world = useRef<World | null>(null),
    rounds = useRef([0, 0]),
    drag = useRef<{
      id: number;
      anchor: Point;
      origin: Point;
      pull: Point;
    } | null>(null);
  const [angle, setAngle] = useState(-25),
    [power, setPower] = useState(0),
    [dragging, setDragging] = useState(false),
    [scores, setScores] = useState([0, 0]),
    [roundWon, setRoundWon] = useState(false),
    [status, setStatus] = useState(
      `Grab your ${palette ? palette.name.toLowerCase() : "purple"} pen, pull back, and release.`,
    ),
    [phase, setPhase] = useState<"aim" | "moving" | "round">("aim");
  const { best, finish } = useGame("pen-fight");
  useCanvasResolution(canvas, W, H);
  function setup() {
    drag.current = null;
    setDragging(false);
    setPower(0);
    if (world.current) Engine.clear(world.current.engine);
    const { engine, pens } = createDesk();
    Events.on(engine, "collisionStart", () => sound("click"));
    world.current = {
      engine,
      pens,
      moving: false,
      turn: "player",
      elapsed: 0,
      quiet: 0,
      cpuDelay: 0,
      accumulator: 0,
    };
    setPhase("aim");
    setStatus(`Grab your ${colorName.current} pen, pull back, and release.`);
  }
  useEffect(() => {
    setup();
    return () => {
      if (world.current) {
        Composite.clear(world.current.engine.world, false);
        Engine.clear(world.current.engine);
      }
    };
  }, []);
  function reset() {
    setup();
  }
  function impulse(
    pen: Body,
    radians: number,
    strength: number,
    contact?: Point,
  ) {
    flickPen(pen, radians, strength, contact);
    const s = world.current!;
    s.moving = true;
    s.elapsed = 0;
    s.quiet = 0;
    setPhase("moving");
    sound();
  }
  function flick() {
    const s = world.current;
    if (!s || phase !== "aim" || s.moving || power < 1) return;
    impulse(s.pens[0], (angle * Math.PI) / 180, power);
    setStatus("Nice flick. Let the physics do its thing.");
  }
  function pointerPoint(e: React.PointerEvent<HTMLDivElement>): Point {
    const rect = canvas.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * W) / rect.width,
      y: ((e.clientY - rect.top) * H) / rect.height,
    };
  }
  function cancelPull() {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    setPower(0);
    setStatus("Flick cancelled. Grab your pen to try again.");
  }
  function updatePull(e: React.PointerEvent<HTMLDivElement>) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== e.pointerId) return;
    const point = pointerPoint(e);
    gesture.pull = {
      x: gesture.anchor.x + point.x - gesture.origin.x,
      y: gesture.anchor.y + point.y - gesture.origin.y,
    };
    const shot = pullShot(gesture.anchor, gesture.pull);
    setPower(shot.power);
    setAngle(Math.round((shot.radians * 180) / Math.PI));
  }
  function startPull(e: React.PointerEvent<HTMLDivElement>) {
    const s = world.current;
    if (
      !s ||
      phase !== "aim" ||
      s.moving ||
      drag.current ||
      !e.isPrimary ||
      e.button !== 0
    )
      return;
    const point = pointerPoint(e),
      rect = canvas.current!.getBoundingClientRect();
    const anchor = penAnchor(
      s.pens[0],
      point,
      e.pointerType === "touch" ? Math.max(12, (18 * W) / rect.width) : 10,
    );
    if (!anchor) {
      setStatus(
        `Grab the ${palette ? palette.name.toLowerCase() : "purple"} pen to start a flick.`,
      );
      return;
    }
    e.preventDefault();
    drag.current = { id: e.pointerId, anchor, origin: point, pull: anchor };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setPower(0);
    setStatus("Pull back, then release. Pick near an end for more spin.");
  }
  function releasePull(e: React.PointerEvent<HTMLDivElement>) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== e.pointerId) return;
    updatePull(e);
    const shot = pullShot(gesture.anchor, gesture.pull);
    drag.current = null;
    setDragging(false);
    const s = world.current;
    if (!s || s.moving || phase !== "aim") return;
    if (shot.power === 0) {
      setPower(0);
      setStatus("Pull back farther before releasing.");
      return;
    }
    impulse(s.pens[0], shot.radians, shot.power, gesture.anchor);
    setStatus("Your pen is in motion…");
  }
  useEffect(() => {
    const cancel = () => cancelPull();
    const hidden = () => {
      if (document.hidden) cancelPull();
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelPull();
    };
    window.addEventListener("blur", cancel);
    window.addEventListener("keydown", escape);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("blur", cancel);
      window.removeEventListener("keydown", escape);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, []);
  useFrame((dt) => {
    const s = world.current,
      ctx = canvas.current?.getContext("2d");
    if (!s || !ctx) return;
    stepPhysics(s, dt);
    if (s.moving) {
      s.elapsed += dt;
      const off = s.pens.map(
        (p) =>
          p.position.x < edge ||
          p.position.x > W - edge ||
          p.position.y < edge ||
          p.position.y > H - edge,
      );
      if (off.some(Boolean)) {
        const playerWon = off[1] && !off[0],
          next = [...rounds.current];
        next[playerWon ? 0 : 1]++;
        rounds.current = next;
        setScores(next);
        setRoundWon(playerWon);
        s.moving = false;
        s.cpuDelay = 0;
        s.pens.forEach((p) => {
          Body.setVelocity(p, { x: 0, y: 0 });
          Body.setAngularVelocity(p, 0);
        });
        setPhase("round");
        setStatus(
          `${playerWon ? "You win" : "Ziggy wins"} round ${next[0] + next[1]}.`,
        );
        finish(next[0], playerWon);
        sound(playerWon ? "win" : "lose");
      } else {
        const still = s.pens.every(
          (p) => p.speed < 0.12 && Math.abs(p.angularVelocity) < 0.008,
        );
        s.quiet = still ? s.quiet + dt : 0;
        if (s.elapsed > 0.5 && (s.quiet > 0.4 || s.elapsed > 7)) {
          s.moving = false;
          s.pens.forEach((p) => {
            Body.setVelocity(p, { x: 0, y: 0 });
            Body.setAngularVelocity(p, 0);
          });
          if (s.turn === "player") {
            s.turn = "cpu";
            s.cpuDelay = 0.7;
            setStatus("Ziggy is lining up a flick…");
          } else {
            s.turn = "player";
            setPhase("aim");
            setPower(0);
            setStatus("Your turn. Grab your pen and pull back.");
          }
        }
      }
    }
    if (s.cpuDelay > 0) {
      s.cpuDelay -= dt;
      if (s.cpuDelay <= 0) {
        const [player, cpu] = s.pens;
        const direction = Math.atan2(
          player.position.y - cpu.position.y,
          player.position.x - cpu.position.x,
        );
        const distance = Vector.magnitude(
          Vector.sub(player.position, cpu.position),
        );
        impulse(
          cpu,
          direction + (Math.random() - 0.5) * [0.7, 0.25, 0.06][level],
          Math.min(100, (36 + distance * 0.15) * [0.75, 1, 1.2][level]),
        );
        setStatus("Ziggy flicked.");
      }
    }
    ctx.fillStyle = "#171a23";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle =
      surface === "midnight"
        ? "#3e4b5c"
        : surface === "arcade"
          ? "#40304f"
          : "#916b48";
    ctx.beginPath();
    ctx.roundRect(edge, edge, W - edge * 2, H - edge * 2, 14);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.rect(edge, edge, W - edge * 2, H - edge * 2);
    ctx.clip();
    for (let i = 0; i < 70; i++) {
      ctx.strokeStyle = i % 3 ? "#573a2626" : "#e0b37b28";
      ctx.beginPath();
      ctx.moveTo(edge, edge + i * 6);
      ctx.bezierCurveTo(200, i * 6 + 20, 420, i * 6 + 50, W - edge, i * 6 + 30);
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = "#d1a77866";
    ctx.lineWidth = 2;
    ctx.strokeRect(46, 46, W - 92, H - 92);
    ctx.fillStyle = "#f0d6ad88";
    ctx.font = "11px Arial";
    ctx.fillText("BOREDOM BUSTER / DESK 01", 58, 70);
    ctx.fillStyle = "#3b2b2188";
    ctx.font = "italic 13px Georgia";
    ctx.save();
    ctx.translate(100, 112);
    ctx.rotate(-0.15);
    ctx.shadowColor = "#0003";
    ctx.shadowBlur = 5;
    ctx.fillStyle = "#ede8d6";
    ctx.fillRect(-32, -26, 64, 54);
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "#99b4c27a";
    ctx.lineWidth = 1;
    for (let line = 0; line < 5; line++) {
      ctx.beginPath();
      ctx.moveTo(-26, -13 + line * 9);
      ctx.lineTo(26, -13 + line * 9);
      ctx.stroke();
    }
    ctx.strokeStyle = "#cf7f7f80";
    ctx.beginPath();
    ctx.moveTo(-17, -26);
    ctx.lineTo(-17, 28);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.translate(300, H - 56);
    ctx.rotate(0.025);
    ctx.fillStyle = "#d9ba70";
    ctx.fillRect(0, 0, 180, 14);
    ctx.strokeStyle = "#705e38";
    ctx.lineWidth = 1;
    for (let tick = 0; tick < 36; tick++) {
      ctx.beginPath();
      ctx.moveTo(tick * 5, 0);
      ctx.lineTo(tick * 5, tick % 5 === 0 ? 9 : 5);
      ctx.stroke();
    }
    ctx.restore();
    if (phase === "aim" && power > 0) {
      const anchor = drag.current?.anchor ?? s.pens[0].position,
        rad = (angle * Math.PI) / 180,
        len = 25 + power * 0.9,
        end = {
          x: anchor.x + Math.cos(rad) * len,
          y: anchor.y + Math.sin(rad) * len,
        };
      ctx.strokeStyle = "#e1d3ff";
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(anchor.x, anchor.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(
        end.x - 12 * Math.cos(rad - 0.5),
        end.y - 12 * Math.sin(rad - 0.5),
      );
      ctx.lineTo(end.x, end.y);
      ctx.lineTo(
        end.x - 12 * Math.cos(rad + 0.5),
        end.y - 12 * Math.sin(rad + 0.5),
      );
      ctx.stroke();
    }
    const gesture = drag.current;
    if (gesture) {
      const shot = pullShot(gesture.anchor, gesture.pull),
        length = Math.min(150, shot.distance),
        pull = {
          x: gesture.anchor.x - Math.cos(shot.radians) * length,
          y: gesture.anchor.y - Math.sin(shot.radians) * length,
        };
      ctx.save();
      ctx.strokeStyle = "#d6c3ff";
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(gesture.anchor.x, gesture.anchor.y);
      ctx.lineTo(pull.x, pull.y);
      ctx.stroke();
      ctx.fillStyle = "#c4a7ff66";
      ctx.beginPath();
      ctx.arc(gesture.anchor.x, gesture.anchor.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e8dbff";
      ctx.beginPath();
      ctx.arc(pull.x, pull.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    s.pens.forEach((p, i) => {
      ctx.save();
      ctx.translate(p.position.x, p.position.y);
      ctx.rotate(p.angle);
      ctx.shadowColor = "#0007";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 7;
      const gradient = ctx.createLinearGradient(0, -7, 0, 7);
      gradient.addColorStop(0, i ? "#ffb1a2" : (palette?.light ?? "#cbb8ff"));
      gradient.addColorStop(0.45, i ? "#d46f64" : (palette?.base ?? "#8a6cdb"));
      gradient.addColorStop(1, i ? "#9c4841" : (palette?.dark ?? "#6046a6"));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(-61, -7, 122, 14, 4);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#d7d1ca";
      ctx.fillRect(-61, -7, 18, 14);
      ctx.beginPath();
      ctx.moveTo(-61, -6);
      ctx.lineTo(-72, 0);
      ctx.lineTo(-61, 6);
      ctx.fill();
      ctx.fillStyle = "#eee";
      ctx.fillRect(22, -9, 31, 3);
      if (palette) {
        ctx.font = "bold 7px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "#182033";
        ctx.fillText(i ? "Z" : "YOU", -10, 2.5);
        ctx.textAlign = "left";
      }
      ctx.restore();
    });
  });
  return (
    <>
      <Toolbar
        stats={[
          ["Round", scores[0] + scores[1] + (phase === "round" ? 0 : 1)],
          ["Best wins", best ?? 0],
        ]}
        onRestart={reset}
      />
      <div
        className={`canvas-wrap pen-desk ${dragging ? "pulling" : ""}`}
        onPointerMove={updatePull}
        onPointerDown={startPull}
        onPointerUp={releasePull}
        onPointerCancel={cancelPull}
        onLostPointerCapture={cancelPull}
      >
        <canvas
          ref={canvas}
          width={W}
          height={H}
          aria-label={`Pen Fight desk. Grab a point on your ${palette ? palette.name.toLowerCase() : "purple"} pen, pull back, and release to flick.`}
        />
      </div>
      <p className="status" role="status">
        {status}
      </p>
      <div className="pen-pull-meter">
        <span>
          {dragging ? "Release to flick" : "Grab · pull back · release"}
        </span>
        <div
          role="progressbar"
          aria-label="Pull power"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={power}
        >
          <i style={{ width: `${power}%` }} />
        </div>
        <strong>{power}%</strong>
      </div>
      {phase === "round" ? (
        <ResultPopup
          key={scores.join(":")}
          scores={scores}
          won={roundWon}
          onContinue={setup}
        />
      ) : (
        <details className="pen-keyboard">
          <summary>Keyboard controls</summary>
          <div className="pen-controls">
            <label>
              Direction <strong>{angle}°</strong>
              <input
                aria-label="Flick angle"
                type="range"
                min="-180"
                max="180"
                value={angle}
                disabled={phase !== "aim"}
                onChange={(e) => setAngle(Number(e.target.value))}
              />
            </label>
            <label>
              Power <strong>{power}%</strong>
              <input
                aria-label="Flick power"
                type="range"
                min="0"
                max="100"
                value={power}
                disabled={phase !== "aim"}
                onChange={(e) => setPower(Number(e.target.value))}
              />
            </label>
            <button
              className="button"
              onClick={flick}
              disabled={phase !== "aim" || power === 0}
            >
              FLICK ↗
            </button>
          </div>
        </details>
      )}
    </>
  );
}
