import { test } from "node:test";
import assert from "node:assert/strict";
import { slide, canMove, spawn } from "../src/games/game2048/logic";
import { bestMove, winner, Mark } from "../src/games/tic-tac-toe/logic";
import { movementTargets } from "../src/games/game2048/motion";
test("2048 animation sends merged and unmerged tiles to their actual destinations", () => {
  const board = [2, 2, 4, 4, ...Array<number>(12).fill(0)];
  assert.deepEqual(movementTargets(board, 3), { 0: 0, 1: 0, 2: 1, 3: 1 });
  assert.deepEqual(movementTargets(board, 1), { 0: 2, 1: 2, 2: 3, 3: 3 });
});
test("2048 merges each tile once, counts points, and handles all directions", () => {
  const row = [2, 2, 2, 2, ...Array<number>(12).fill(0)];
  assert.deepEqual(slide(row, 3).board.slice(0, 4), [4, 4, 0, 0]);
  assert.equal(slide(row, 3).score, 8);
  assert.deepEqual(slide(row, 1).board.slice(0, 4), [0, 0, 4, 4]);
  const column = [2, 0, 0, 0, 2, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0];
  assert.deepEqual(
    slide(column, 0).board.filter((_, i) => i % 4 === 0),
    [4, 8, 0, 0],
  );
  assert.deepEqual(
    slide(column, 2).board.filter((_, i) => i % 4 === 0),
    [0, 0, 4, 8],
  );
});
test("2048 recognizes stuck and mergeable boards", () => {
  const full = [2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2];
  assert.equal(canMove(full), false);
  full[0] = 4;
  assert.equal(canMove(full), true);
  const b = Array<number>(16).fill(0);
  assert.equal(spawn(b).filter(Boolean).length, 1);
  assert.equal(b.filter(Boolean).length, 0);
});
test("hard tic tac toe takes a win and blocks a loss", () => {
  assert.equal(bestMove(["O", "O", null, "X", "X", null, null, null, null]), 2);
  assert.equal(
    bestMove(["X", "X", null, null, "O", null, null, null, null]),
    2,
  );
});
test("hard tic tac toe cannot lose to any possible X sequence", () => {
  function walk(board: Mark[], turn: "X" | "O") {
    const line = winner(board);
    if (line) {
      assert.notEqual(board[line[0]], "X");
      return;
    }
    if (board.every(Boolean)) return;
    if (turn === "O") {
      const next = [...board];
      next[bestMove(board)] = "O";
      walk(next, "X");
    } else
      board.forEach((v, i) => {
        if (!v) {
          const next = [...board];
          next[i] = "X";
          walk(next, "O");
        }
      });
  }
  walk(Array<Mark>(9).fill(null), "X");
});
