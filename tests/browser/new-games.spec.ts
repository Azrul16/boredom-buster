import { expect, test, type Page } from "@playwright/test";
import {
  neighbors,
  sudokuAllowed,
  toggleLights,
  words,
} from "../../src/games/shared/puzzles";

async function played(page: Page) {
  return page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("timepass_profile") || "{}").played || 0,
  );
}

test("Connect Four Ziggy blocks a vertical threat and restart cancels its pending move", async ({
  page,
}) => {
  await page.goto("/games/connect-four/");
  const column = page.getByRole("button", {
    name: "Drop in column 1",
    exact: true,
  });
  for (let turn = 0; turn < 3; turn++) {
    await column.click();
    await expect(page.locator(".disc-2")).toHaveCount(turn + 1);
  }
  await expect(page.locator(".disc").nth(14)).toHaveClass("disc disc-2");
  await column.click();
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await page.waitForTimeout(550);
  await expect(page.locator(".disc-0")).toHaveCount(42);
  expect(await played(page)).toBe(0);
});

test("Minesweeper first reveal is safe, flags work on touch, and mines end a round", async ({
  page,
}) => {
  // The deterministic shuffle puts the first ten eligible indices after the first at the front.
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.goto("/games/minesweeper/");
  await page
    .getByRole("button", { name: "Flag mode off", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Cell 64: covered", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Cell 64: flagged", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Cell 64: flagged", exact: true })
    .click();
  await page.getByRole("button", { name: "Flag mode on", exact: true }).click();
  await page
    .getByRole("button", { name: "Cell 1: covered", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Cell 1: 0 neighboring mines",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Cell 4: covered", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await played(page)).toBe(1);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator(".mine-grid .revealed")).toHaveCount(0);
});

function slideSolution(initial: string) {
  const queue = [initial],
    seen = new Map<string, { previous: string; tile: number }>();
  seen.set(initial, { previous: "", tile: 0 });
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const state = queue[cursor];
    if (state === "123456780") {
      const moves: number[] = [];
      let current = state;
      while (current !== initial) {
        const step = seen.get(current)!;
        moves.push(step.tile);
        current = step.previous;
      }
      return moves.reverse();
    }
    const blank = state.indexOf("0");
    for (const i of neighbors(blank, 3)) {
      const cells = [...state];
      [cells[blank], cells[i]] = [cells[i], cells[blank]];
      const next = cells.join("");
      if (!seen.has(next)) {
        seen.set(next, { previous: state, tile: Number(state[i]) });
        queue.push(next);
      }
    }
  }
  throw new Error("Unsolvable sliding board");
}
test("Sliding Puzzle completes a legal solution and saves its score once", async ({
  page,
}) => {
  await page.goto("/games/sliding-puzzle/");
  await expect(page.locator(".slide-grid button")).toHaveCount(9);
  const initial = (await page.locator(".slide-grid button").allTextContents())
    .map((v) => v || "0")
    .join("");
  for (const tile of slideSolution(initial))
    await page
      .getByRole("button", { name: `Slide tile ${tile}`, exact: true })
      .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await played(page)).toBe(1);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(await played(page)).toBe(1);
});

test("Lights Out can be solved and awards a win", async ({ page }) => {
  await page.goto("/games/lights-out/");
  await expect(page.locator(".lights-grid button")).toHaveCount(16);
  const board = await page
    .locator(".lights-grid button")
    .evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute("aria-pressed") === "true"),
    );
  const initial = board.reduce((bits, on, i) => bits | (on ? 1 << i : 0), 0);
  const masks = Array.from({ length: 16 }, (_, i) =>
    toggleLights(Array(16).fill(false), i).reduce(
      (bits, on, j) => bits | (on ? 1 << j : 0),
      0,
    ),
  );
  let solution = -1;
  for (let mask = 0; mask < 65536; mask++) {
    let next = initial;
    for (let i = 0; i < 16; i++) if (mask & (1 << i)) next ^= masks[i];
    if (!next) {
      solution = mask;
      break;
    }
  }
  expect(solution).toBeGreaterThanOrEqual(0);
  for (let i = 0; i < 16; i++)
    if (solution & (1 << i))
      await page
        .getByRole("button", { name: `Light ${i + 1}`, exact: true })
        .click();
  await expect(
    page.getByRole("heading", { name: "Lights out. Nicely done!" }),
  ).toBeVisible();
  expect(await played(page)).toBe(1);
});

function solveSudoku(board: number[]): number[] | undefined {
  const index = board.indexOf(0);
  if (index < 0) return board;
  for (let value = 1; value <= 4; value++)
    if (sudokuAllowed(board, index, value)) {
      const next = [...board];
      next[index] = value;
      const result = solveSudoku(next);
      if (result) return result;
    }
}
test("Mini Sudoku rejects conflicts, preserves clues, and accepts a complete solution", async ({
  page,
}) => {
  await page.goto("/games/mini-sudoku/");
  await expect(page.locator(".sudoku-grid button")).toHaveCount(16);
  const board = (
    await page.locator(".sudoku-grid button").allTextContents()
  ).map((v) => Number(v) || 0);
  const solution = solveSudoku(board)!;
  const first = board.indexOf(0);
  const conflict = [1, 2, 3, 4].find(
    (value) => !sudokuAllowed(board, first, value),
  )!;
  await page.locator(".sudoku-grid button").nth(first).click();
  await page
    .locator(".mini-keypad")
    .getByRole("button", { name: String(conflict), exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("already appears");
  for (let i = 0; i < 16; i++)
    if (!board[i]) {
      await page.locator(".sudoku-grid button").nth(i).click();
      await page.keyboard.press(String(solution[i]));
    }
  await expect(
    page.getByRole("heading", { name: "Sudoku solved!" }),
  ).toBeVisible();
  expect(await played(page)).toBe(1);
});

test("Hangman and Word Scramble accept answers and persist completed wins", async ({
  page,
}) => {
  for (const slug of ["hangman", "word-scramble"]) {
    await page.goto(`/games/${slug}/`);
    const clue = await page.locator(".mini-clue").innerText();
    const word = words.find(([, hint]) => clue.includes(hint))![0];
    if (slug === "hangman") {
      for (const letter of new Set(word)) await page.keyboard.press(letter);
    } else {
      await page
        .getByLabel("Your word", { exact: true })
        .fill(word.toLowerCase());
      await page
        .getByRole("button", { name: "Check word", exact: true })
        .click();
    }
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  }
  expect(await played(page)).toBe(2);
  const wins = await page.evaluate(
    () => JSON.parse(localStorage.getItem("timepass_profile")!).wins,
  );
  expect(wins.hangman).toBe(1);
  expect(wins["word-scramble"]).toBe(1);
});

test("Number Guess narrows the range and can always be won within seven guesses", async ({
  page,
}) => {
  await page.goto("/games/number-guess/");
  await expect(page.locator(".number-range span")).toHaveCount(2);
  for (let attempt = 0; attempt < 7; attempt++) {
    const bounds = (
      await page.locator(".number-range span").allTextContents()
    ).map(Number);
    await page
      .getByLabel("Your guess (1–100)")
      .fill(String(Math.floor((bounds[0] + bounds[1]) / 2)));
    await page
      .getByRole("button", { name: "Guess number", exact: true })
      .click();
    if (await page.getByRole("dialog").count()) break;
  }
  await expect(
    page.getByRole("heading", { name: "You found the number!" }),
  ).toBeVisible();
  expect(await played(page)).toBe(1);
});

test("Math Challenge scores ten answers and starts a new round without double counting", async ({
  page,
}) => {
  await page.goto("/games/math-challenge/");
  for (let i = 0; i < 10; i++) {
    const question = await page.locator(".math-question").innerText();
    const [a, b] = question.match(/\d+/g)!.map(Number);
    const answer = question.includes("+")
      ? a + b
      : question.includes("×")
        ? a * b
        : a - b;
    await page.getByLabel("Your answer", { exact: true }).fill(String(answer));
    await page
      .getByRole("button", { name: "Submit answer", exact: true })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "10 out of 10 correct!" }),
  ).toBeVisible();
  expect(await played(page)).toBe(1);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator(".mini-metrics")).toContainText("1/10");
  expect(await played(page)).toBe(1);
  await page.reload();
  await expect(page.locator(".game-toolbar")).toContainText("100");
});

test("Whack-a-Mole counts each target once, pauses its clock, and finishes", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/games/whack-a-mole/");
  await expect(
    page.getByRole("button", { name: "Start game", exact: true }),
  ).toBeVisible();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.getByRole("button", { name: "Start game", exact: true }).click();
  const label = await page
    .getByRole("button", { name: /^Whack mole/ })
    .getAttribute("aria-label");
  const index = Number(label!.match(/\d+/)![0]) - 1;
  await page.locator(".mole-grid button").nth(index).click();
  await page.locator(".mole-grid button").nth(index).click();
  await expect(page.locator(".mini-metrics")).toContainText(/Score\s*10/);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.clock.fastForward(5000);
  await expect(page.locator(".mini-metrics")).toContainText(/Time\s*20s/);
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.clock.runFor(20000);
  await expect(
    page.getByRole("heading", { name: "Time's up!", exact: true }),
  ).toBeVisible();
  expect(await played(page)).toBe(1);
  await page.clock.runFor(1000);
  await expect(
    page.getByRole("button", { name: "Start game", exact: true }),
  ).toBeVisible();
});
