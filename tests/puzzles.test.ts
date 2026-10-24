import assert from "node:assert/strict";
import test from "node:test";
import {
  connectWinner,
  cpuColumn,
  botColumn,
  dropDisc,
  makeLights,
  makeMines,
  makeSliding,
  makeSudoku,
  mineCount,
  neighbors,
  revealMines,
  sudokuAllowed,
  sudokuSolutions,
  toggleLights,
} from "../src/games/shared/puzzles";

test("Connect Four respects gravity, full columns, diagonals, and Ziggy threats", () => {
  let board = Array<number>(42).fill(0);
  board = dropDisc(board, 0, 1)!;
  assert.equal(board[35], 1);
  for (let i = 0; i < 5; i++) board = dropDisc(board, 0, 2)!;
  assert.equal(dropDisc(board, 0, 1), null);
  for (const line of [
    [35, 36, 37, 38],
    [0, 7, 14, 21],
    [14, 22, 30, 38],
    [35, 29, 23, 17],
  ]) {
    const state = Array<number>(42).fill(0);
    line.forEach((i) => (state[i] = 1));
    assert.equal(connectWinner(state), 1);
  }
  const wrapped = Array<number>(42).fill(0);
  [5, 6, 7, 8].forEach((i) => (wrapped[i] = 1));
  assert.equal(connectWinner(wrapped), 0);
  const threat = Array<number>(42).fill(0);
  [35, 36, 37].forEach((i) => (threat[i] = 1));
  assert.equal(cpuColumn(threat), 3);
  [41, 34, 27].forEach((i) => (threat[i] = 2));
  assert.equal(cpuColumn(threat), 6); // Take a vertical win instead of blocking.
});

test("difficulty changes mine density, puzzle clues, light dimensions, and bot planning", () => {
  for (const count of [8, 10, 14]) {
    const mines = makeMines(27, count);
    assert.equal(mines.size, count);
    assert.equal(mineCount(mines, 27), 0);
  }
  for (const clues of [10, 7, 4]) {
    const { puzzle } = makeSudoku(clues);
    assert.equal(sudokuSolutions(puzzle), 1);
    assert.ok(puzzle.filter(Boolean).length >= clues);
  }
  assert.equal(makeLights(5, 15).length, 25);
  assert.deepEqual(
    toggleLights(Array(25).fill(false), 0, 5).flatMap((on, i) =>
      on ? [i] : [],
    ),
    [0, 1, 5],
  );
  const threat = Array<number>(42).fill(0);
  [35, 36, 37].forEach((i) => (threat[i] = 1));
  assert.equal(botColumn(threat, 2), 3);
  assert.ok(botColumn(threat, 0) >= 0);
});

test("Minesweeper protects every first reveal and expands empty areas without flags", () => {
  for (let first = 0; first < 64; first++) {
    const mines = makeMines(first);
    assert.equal(mines.size, 10);
    assert.equal(mines.has(first), false);
    assert.equal(mineCount(mines, first), 0);
    const flags = new Set([neighbors(first, 8)[0]]);
    const open = revealMines(mines, new Set(), flags, first);
    assert.ok(open.has(first));
    for (const i of open) {
      assert.ok(!mines.has(i));
      assert.ok(!flags.has(i));
    }
  }
  assert.deepEqual(neighbors(0, 8, true), [1, 8, 9]);
  const mines = new Set(Array.from({ length: 10 }, (_, i) => i));
  let open = new Set<number>();
  for (let i = 10; i < 64; i++) open = revealMines(mines, open, new Set(), i);
  assert.equal(open.size, 54);
});

test("Sliding Puzzle only generates unsolved boards with even inversion parity", () => {
  for (let sample = 0; sample < 40; sample++) {
    const board = makeSliding();
    assert.equal(new Set(board).size, 9);
    assert.ok(board.some((value, i) => value !== (i + 1) % 9));
    const tiles = board.filter(Boolean);
    let inversions = 0;
    tiles.forEach((v, i) =>
      tiles.slice(i + 1).forEach((w) => {
        if (v > w) inversions++;
      }),
    );
    assert.equal(inversions % 2, 0);
  }
});

test("Lights Out uses orthogonal neighbors and generates reachable nonempty boards", () => {
  const empty = Array<boolean>(16).fill(false);
  assert.deepEqual(
    toggleLights(empty, 0).flatMap((value, i) => (value ? [i] : [])),
    [0, 1, 4],
  );
  assert.deepEqual(toggleLights(toggleLights(empty, 5), 5), empty);
  const reachable = new Set<number>([0]);
  for (let index = 0; index < 16; index++) {
    const mask = toggleLights(empty, index).reduce(
      (bits, on, i) => bits | (on ? 1 << i : 0),
      0,
    );
    for (const old of [...reachable]) reachable.add(old ^ mask);
  }
  for (let sample = 0; sample < 30; sample++) {
    const board = makeLights();
    assert.ok(board.some(Boolean));
    assert.ok(
      reachable.has(board.reduce((bits, on, i) => bits | (on ? 1 << i : 0), 0)),
    );
  }
});

test("Mini Sudoku puzzles have exactly one solution and obey row, column, and box rules", () => {
  for (let sample = 0; sample < 30; sample++) {
    const { puzzle, solution } = makeSudoku();
    assert.equal(sudokuSolutions(puzzle), 1);
    assert.ok(puzzle.includes(0));
    assert.ok(solution.every((value, i) => sudokuAllowed(solution, i, value)));
    assert.ok(puzzle.every((value, i) => !value || solution[i] === value));
  }
  const empty = Array<number>(16).fill(0);
  empty[0] = 1;
  assert.equal(sudokuAllowed(empty, 3, 1), false);
  assert.equal(sudokuAllowed(empty, 12, 1), false);
  assert.equal(sudokuAllowed(empty, 5, 1), false);
  assert.equal(sudokuAllowed(empty, 10, 1), true);
});
