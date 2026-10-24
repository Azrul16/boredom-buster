import { Bodies, Body, Composite, Engine, Vector } from "matter-js";
export function stepPhysics(
  world: { engine: Engine; accumulator: number },
  dt: number,
) {
  world.accumulator += dt * 1000;
  while (world.accumulator >= 1000 / 60 - 0.00001) {
    Engine.update(world.engine, 1000 / 60);
    world.accumulator -= 1000 / 60;
  }
}
export function createDesk() {
  const engine = Engine.create({ gravity: { x: 0, y: 0 } });
  const settings = { frictionAir: 0.026, restitution: 0.55, density: 0.004 };
  const pens = [
    Bodies.rectangle(230, 270, 122, 14, {
      ...settings,
      angle: -0.4,
      label: "player",
    }),
    Bodies.rectangle(440, 150, 122, 14, {
      ...settings,
      angle: 0.4,
      label: "cpu",
    }),
  ];
  Composite.add(engine.world, pens);
  return { engine, pens };
}
export type Point = { x: number; y: number };
export function penAnchor(
  pen: Pick<Body, "position" | "angle">,
  point: Point,
  tolerance = 12,
): Point | null {
  const dx = point.x - pen.position.x,
    dy = point.y - pen.position.y,
    c = Math.cos(pen.angle),
    s = Math.sin(pen.angle);
  const x = dx * c + dy * s,
    y = -dx * s + dy * c;
  if (Math.abs(x) > 61 + tolerance || Math.abs(y) > 7 + tolerance) return null;
  const localX = Math.max(-60, Math.min(60, x)),
    localY = Math.max(-7, Math.min(7, y));
  return {
    x: pen.position.x + localX * c - localY * s,
    y: pen.position.y + localX * s + localY * c,
  };
}
export function pullShot(anchor: Point, pointer: Point, maxPull = 150) {
  const dx = anchor.x - pointer.x,
    dy = anchor.y - pointer.y,
    distance = Math.hypot(dx, dy);
  return {
    radians: Math.atan2(dy, dx),
    power:
      distance < 8 ? 0 : Math.min(100, Math.round((distance / maxPull) * 100)),
    distance,
  };
}
export function flickPen(
  pen: Body,
  radians: number,
  strength: number,
  contact?: Point,
) {
  const force = Vector.mult(
    { x: Math.cos(radians), y: Math.sin(radians) },
    strength * 0.0022,
  );
  // Slightly off-center contact gives a flick its characteristic rotation.
  Body.applyForce(
    pen,
    contact ?? {
      x: pen.position.x - Math.sin(radians) * 4,
      y: pen.position.y + Math.cos(radians) * 4,
    },
    force,
  );
}
