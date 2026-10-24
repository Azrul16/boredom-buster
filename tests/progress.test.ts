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

test("difficulty records stay separate while earlier all-time scores are preserved", () => {
  values.set(
    "timepass_profile",
    JSON.stringify({ best: { snake: 900 }, xp: 40, played: 2 }),
  );
  saveBest("snake", 100, "easy");
  saveBest("snake", 400, "hard");
  saveBest("snake", 200, "hard");
  const profile = getProfile();
  assert.equal(profile.best.snake, 900);
  assert.deepEqual(profile.modeBest.snake, { easy: 100, hard: 400 });
  assert.equal(profile.played, 2);
  recordGame("reaction-time", 180, true, undefined, "hard");
  recordGame("reaction-time", 250, true, undefined, "easy");
  recordGame("reaction-time", 210, true, undefined, "hard");
  assert.deepEqual(getProfile().modeBest["reaction-time"], {
    easy: 250,
    hard: 180,
  });
  assert.equal(getProfile().results[0].difficulty, "hard");
});

test("recent results are capped without losing lifetime totals and bests", () => {
  for (let i = 0; i < 105; i++)
    recordGame("math-challenge", i === 0 ? 100 : 10, true, undefined, "medium");
  const profile = getProfile();
  assert.equal(profile.results.length, 100);
  assert.equal(profile.played, 105);
  assert.equal(profile.best["math-challenge"], 100);
  assert.equal(profile.modeBest["math-challenge"].medium, 100);
  assert.ok(profile.results.every((result) => result.score === 10));
});

test("malformed saved fields and invalid scores do not corrupt local records", () => {
  values.set(
    "timepass_profile",
    JSON.stringify({
      xp: "bad",
      achievements: {},
      best: { snake: 100, pong: "bad" },
      results: [null, {}, { game: "unknown" }],
      daily: { date: localDay(), done: null },
    }),
  );
  const profile = getProfile();
  assert.equal(profile.xp, 0);
  assert.deepEqual(profile.achievements, []);
  assert.deepEqual(profile.results, []);
  assert.deepEqual(profile.best, { snake: 100 });
  recordGame("snake", NaN);
  assert.equal(getProfile().played, 0);
});
