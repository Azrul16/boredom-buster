import { test } from "node:test";
import assert from "node:assert/strict";
import { Engine } from "matter-js";
import {
  createDesk,
  flickPen,
  stepPhysics,
} from "../src/games/pen-fight/physics";
import { penAnchor, pullShot } from "../src/games/pen-fight/physics";
test("pull distance controls power and release direction opposes the pull", () => {
  const anchor = { x: 100, y: 100 };
  assert.equal(pullShot(anchor, { x: 25, y: 100 }).power, 50);
  assert.equal(pullShot(anchor, { x: -50, y: 100 }).power, 100);
  assert.equal(pullShot(anchor, { x: -500, y: 100 }).power, 100);
  assert.equal(pullShot(anchor, { x: 98, y: 99 }).power, 0);
  assert.equal(pullShot(anchor, { x: 25, y: 100 }).radians, 0);
  assert.equal(pullShot(anchor, { x: 100, y: 175 }).radians, -Math.PI / 2);
});
test("pen grabbing respects rotation, ignores desk clicks, and anchors on the actual pen", () => {
  const { pens } = createDesk(),
    p = pens[0];
  assert.equal(penAnchor(p, { x: 50, y: 50 }), null);
  const end = {
    x: p.position.x + 45 * Math.cos(p.angle),
    y: p.position.y + 45 * Math.sin(p.angle),
  };
  const anchor = penAnchor(p, end)!;
  assert.ok(Math.hypot(anchor.x - end.x, anchor.y - end.y) < 0.001);
  assert.equal(penAnchor(p, { x: 440, y: 150 }), null);
});
test("off-center grabbing produces spin while a centered pull translates without added spin", () => {
  function run(offset: number) {
    const { engine, pens } = createDesk(),
      p = pens[0],
      contact = {
        x: p.position.x + offset * Math.cos(p.angle),
        y: p.position.y + offset * Math.sin(p.angle),
      };
    flickPen(p, -Math.PI / 2, 50, contact);
    Engine.update(engine, 1000 / 60);
    return p;
  }
  const center = run(0),
    end = run(45);
  assert.ok(Math.abs(center.angularVelocity) < 0.00001);
  assert.ok(Math.abs(end.angularVelocity) > 0.01);
  assert.ok(end.position.y < 270);
  assert.ok(Math.abs(center.velocity.y - end.velocity.y) < 0.001);
});
test("Pen Fight motion is consistent at 30, 60, and 120 Hz displays", () => {
  const run = (hz: number) => {
    const desk = { ...createDesk(), accumulator: 0 };
    flickPen(desk.pens[0], -0.45, 55);
    for (let frame = 0; frame < hz * 3; frame++) stepPhysics(desk, 1 / hz);
    return desk.pens[0].position;
  };
  const normal = run(60);
  for (const hz of [30, 120]) {
    const other = run(hz);
    assert.ok(Math.abs(normal.x - other.x) < 0.001);
    assert.ok(Math.abs(normal.y - other.y) < 0.001);
  }
});
test("pen impulses produce deterministic translation, rotation, and friction", () => {
  function run() {
    const { engine, pens } = createDesk();
    flickPen(pens[0], -0.45, 55);
    for (let i = 0; i < 240; i++) Engine.update(engine, 1000 / 60);
    return pens.map((p) => ({
      x: p.position.x,
      y: p.position.y,
      angle: p.angle,
      speed: p.speed,
    }));
  }
  const a = run(),
    b = run();
  assert.deepEqual(a, b);
  assert.ok(a[0].x > 270);
  assert.ok(Math.abs(a[0].angle + 0.4) > 0.01);
  assert.ok(a[0].speed < 0.05);
});
test("aimed pen flicks can collide and displace the opponent", () => {
  const { engine, pens } = createDesk();
  const direction = Math.atan2(
    pens[1].position.y - pens[0].position.y,
    pens[1].position.x - pens[0].position.x,
  );
  flickPen(pens[0], direction, 100);
  for (let i = 0; i < 300; i++) Engine.update(engine, 1000 / 60);
  assert.ok(
    Math.hypot(pens[1].position.x - 440, pens[1].position.y - 150) > 30,
  );
});
