import assert from "node:assert/strict";
import test from "node:test";
import {
  cleanPersonalization,
  defaultPersonalization,
  isPalette,
} from "../src/lib/personalization";

test("personalization rejects corrupt values, unknown colors, and invalid game IDs", () => {
  assert.deepEqual(cleanPersonalization(null), defaultPersonalization);
  const clean = cleanPersonalization({
    accent: "constructor",
    surface: "unknown",
    density: "tiny",
    favorites: ["snake", "snake", "not-a-game", null],
    recent: ["pong", 42, "snake", "pong"],
    gameColors: { snake: "mint", pong: "wrong", unknown: "coral" },
  });
  assert.equal(clean.accent, "violet");
  assert.equal(clean.surface, "classic");
  assert.equal(clean.density, "compact");
  assert.deepEqual(clean.favorites, ["snake"]);
  assert.deepEqual(clean.recent, ["pong", "snake"]);
  assert.deepEqual(clean.gameColors, { snake: "mint" });
  assert.equal(isPalette("__proto__"), false);
});

test("valid preferences preserve ordering, game colors, and explicit disabled options", () => {
  const preferences = {
    ...defaultPersonalization,
    accent: "ocean",
    surface: "midnight",
    density: "comfortable",
    focus: true,
    effects: false,
    autoReplay: false,
    favorites: ["pen-fight", "snake"],
    recent: ["snake", "pen-fight"],
    gameColors: { "pen-fight": "mint" },
  };
  assert.deepEqual(cleanPersonalization(preferences), preferences);
  assert.deepEqual(
    cleanPersonalization(JSON.parse(JSON.stringify(preferences))),
    preferences,
  );
});
