import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  challenges,
  getProfile,
  localDay,
  recordGame,
  saveBest,
} from "../src/lib/progress";
import { writeStore, readStore } from "../src/lib/storage";
const values = new Map<string, string>();
beforeEach(() => {
  values.clear();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: new EventTarget(),
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => values.get(k) ?? null,
      setItem: (k: string, v: string) => values.set(k, v),
    },
  });
});
test("daily rewards and achievements are awarded once while games keep counting", () => {
  const target = challenges().find((c) => c.id === "reaction")!.target;
  recordGame("reaction-time", 170);
  const a = getProfile();
  assert.equal(a.played, 1);
  assert.equal(a.xp, 220);
  assert.ok(a.daily.done.includes("reaction"));
  assert.ok(a.achievements.includes("speed"));
  recordGame("reaction-time", target - 1);
  const b = getProfile();
  assert.equal(b.played, 2);
  assert.equal(b.xp, 240);
  assert.equal(b.best["reaction-time"], 170);
  assert.equal(b.streak, 1);
});
test("challenge state resets by local date while lifetime XP and wins remain", () => {
  recordGame("pen-fight", 2, true);
  recordGame("pen-fight", 2, true);
  const a = getProfile();
  assert.ok(a.daily.done.includes("pen"));
  a.daily.date = "2000-01-01";
  writeStore("profile", a);
  const b = getProfile();
  assert.equal(b.daily.date, localDay());
  assert.deepEqual(b.daily.done, []);
  assert.equal(b.daily.penWins, 0);
  assert.equal(b.wins["pen-fight"], 2);
  assert.equal(b.xp, a.xp);
});
test("best scores persist during a game without granting XP or counting a completed game", () => {
  saveBest("snake", 500);
  saveBest("snake", 300);
  assert.equal(getProfile().best.snake, 500);
  assert.equal(getProfile().played, 0);
  assert.equal(readStore("snake_highscore", 0), 500);
});
test("corrupt JSON, null profiles and denied storage do not break play", () => {
  values.set("timepass_profile", "{broken");
  assert.equal(getProfile().played, 0);
  values.set("timepass_profile", "null");
  assert.equal(getProfile().played, 0);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get: () => {
      throw new Error("Storage blocked");
    },
  });
  assert.doesNotThrow(() => recordGame("snake", 100));
});
