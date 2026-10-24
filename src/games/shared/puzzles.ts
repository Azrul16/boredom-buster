export function shuffled<T>(values: readonly T[]): T[] {
  const next = [...values];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function neighbors(
  index: number,
  width: number,
  diagonal = false,
  height = width,
) {
  const result: number[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if ((!dx && !dy) || (!diagonal && Math.abs(dx) + Math.abs(dy) !== 1))
        continue;
      const x = (index % width) + dx,
        y = Math.floor(index / width) + dy;
      if (x >= 0 && x < width && y >= 0 && y < height)
        result.push(y * width + x);
    }
  return result;
}

export function dropDisc(board: number[], column: number, player: number) {
  const next = [...board];
  for (let row = 5; row >= 0; row--) {
    const i = row * 7 + column;
    if (!next[i]) {
      next[i] = player;
      return next;
    }
  }
  return null;
}

export function connectWinner(board: number[]) {
  for (let row = 0; row < 6; row++)
    for (let col = 0; col < 7; col++) {
      const player = board[row * 7 + col];
      if (!player) continue;
      for (const [dx, dy] of [
        [1, 0],
        [0, 1],
        [1, 1],
        [1, -1],
      ]) {
        if (
          Array.from({ length: 4 }, (_, step) => {
            const x = col + dx * step,
              y = row + dy * step;
            return (
              x >= 0 && x < 7 && y >= 0 && y < 6 && board[y * 7 + x] === player
            );
          }).every(Boolean)
        )
          return player;
      }
    }
  return 0;
}

export function cpuColumn(board: number[]) {
  const columns = [3, 2, 4, 1, 5, 0, 6].filter((col) => !board[col]);
  for (const player of [2, 1]) {
    const win = columns.find(
      (col) => connectWinner(dropDisc(board, col, player)!) === player,
    );
    if (win !== undefined) return win;
  }
  // Prefer moves that do not give the opponent an immediate winning reply.
  return (
    columns.find((col) => {
      const next = dropDisc(board, col, 2)!;
      return columns.every((reply) => {
        const after = dropDisc(next, reply, 1);
        return !after || connectWinner(after) !== 1;
      });
    }) ?? columns[0]
  );
}

export function botColumn(board: number[], level: number) {
  const columns = [3, 2, 4, 1, 5, 0, 6].filter((col) => !board[col]);
  if (level === 0) return columns[Math.floor(Math.random() * columns.length)];
  if (level === 1) return cpuColumn(board);
  function evaluate(state: number[]) {
    let score = 0;
    for (let row = 0; row < 6; row++)
      for (let col = 0; col < 7; col++) {
        for (const [dx, dy] of [
          [1, 0],
          [0, 1],
          [1, 1],
          [1, -1],
        ]) {
          const cells = Array.from({ length: 4 }, (_, i) => {
            const x = col + dx * i,
              y = row + dy * i;
            return x >= 0 && x < 7 && y >= 0 && y < 6 ? state[y * 7 + x] : -1;
          });
          if (cells.includes(-1)) continue;
          const own = cells.filter((v) => v === 2).length,
            other = cells.filter((v) => v === 1).length;
          if (!other) score += [0, 1, 5, 40, 10000][own];
          if (!own) score -= [0, 1, 6, 50, 10000][other];
        }
      }
    return score;
  }
  function search(
    state: number[],
    depth: number,
    maximizing: boolean,
    alpha: number,
    beta: number,
  ): number {
    const winner = connectWinner(state);
    if (winner) return winner === 2 ? 100000 + depth : -100000 - depth;
    const legal = columns.filter((col) => !state[col]);
    if (!legal.length) return 0;
    if (!depth) return evaluate(state);
    let value = maximizing ? -Infinity : Infinity;
    for (const col of legal) {
      const result = search(
        dropDisc(state, col, maximizing ? 2 : 1)!,
        depth - 1,
        !maximizing,
        alpha,
        beta,
      );
      value = maximizing ? Math.max(value, result) : Math.min(value, result);
      if (maximizing) alpha = Math.max(alpha, value);
      else beta = Math.min(beta, value);
      if (beta <= alpha) break;
    }
    return value;
  }
  let best = columns[0],
    score = -Infinity;
  for (const col of columns) {
    const next = search(
      dropDisc(board, col, 2)!,
      3,
      false,
      -Infinity,
      Infinity,
    );
    if (next > score) {
      score = next;
      best = col;
    }
  }
  return best;
}

export function makeMines(first: number, count = 10) {
  const safe = new Set([first, ...neighbors(first, 8, true)]);
  return new Set(
    shuffled(
      Array.from({ length: 64 }, (_, i) => i).filter((i) => !safe.has(i)),
    ).slice(0, count),
  );
}
export function mineCount(mines: Set<number>, index: number) {
  return neighbors(index, 8, true).filter((i) => mines.has(i)).length;
}
export function revealMines(
  mines: Set<number>,
  open: Set<number>,
  flags: Set<number>,
  index: number,
) {
  const next = new Set(open),
    pending = [index];
  while (pending.length) {
    const i = pending.pop()!;
    if (next.has(i) || flags.has(i) || mines.has(i)) continue;
    next.add(i);
    if (!mineCount(mines, i)) pending.push(...neighbors(i, 8, true));
  }
  return next;
}

export function toggleLights(board: boolean[], index: number, width = 4) {
  const next = [...board];
  for (const i of [index, ...neighbors(index, width)]) next[i] = !next[i];
  return next;
}
export function makeLights(width = 4, switches = 7) {
  let board = Array<boolean>(width * width).fill(false);
  for (const i of shuffled(
    Array.from({ length: width * width }, (_, i) => i),
  ).slice(0, switches))
    board = toggleLights(board, i, width);
  return board.some(Boolean) ? board : toggleLights(board, 5, width);
}
export function makeSliding(steps = 100) {
  const board = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  let blank = 8,
    previous = -1;
  for (let step = 0; step < steps; step++) {
    const next = shuffled(neighbors(blank, 3).filter((i) => i !== previous))[0];
    [board[blank], board[next]] = [board[next], board[blank]];
    previous = blank;
    blank = next;
  }
  if (board.every((value, i) => value === (i + 1) % 9))
    [board[7], board[8]] = [board[8], board[7]];
  return board;
}

export function sudokuAllowed(board: number[], index: number, value: number) {
  const row = Math.floor(index / 4),
    col = index % 4;
  return board.every(
    (cell, i) =>
      i === index ||
      cell !== value ||
      (Math.floor(i / 4) !== row &&
        i % 4 !== col &&
        !(
          Math.floor(i / 8) === Math.floor(row / 2) &&
          Math.floor((i % 4) / 2) === Math.floor(col / 2)
        )),
  );
}
export function sudokuSolutions(board: number[], limit = 2): number {
  const index = board.indexOf(0);
  if (index === -1)
    return board.every((v, i) => sudokuAllowed(board, i, v)) ? 1 : 0;
  let count = 0;
  for (let v = 1; v <= 4; v++)
    if (sudokuAllowed(board, index, v)) {
      const next = [...board];
      next[index] = v;
      count += sudokuSolutions(next, limit - count);
      if (count >= limit) break;
    }
  return count;
}
export function makeSudoku(clues = 7) {
  const digits = shuffled([1, 2, 3, 4]);
  const solution = [0, 1, 2, 3, 2, 3, 0, 1, 1, 2, 3, 0, 3, 0, 1, 2].map(
    (i) => digits[i],
  );
  const puzzle = [...solution];
  for (const index of shuffled(Array.from({ length: 16 }, (_, i) => i))) {
    if (puzzle.filter(Boolean).length <= clues) break;
    const old = puzzle[index];
    puzzle[index] = 0;
    if (sudokuSolutions(puzzle) !== 1) puzzle[index] = old;
  }
  return { puzzle, solution };
}

export const words = [
  ["NOTEBOOK", "A book of blank pages for your ideas"],
  ["ELEPHANT", "A large animal with a trunk"],
  ["MOUNTAIN", "A tall natural peak"],
  ["KEYBOARD", "Rows of keys used for typing"],
  ["UMBRELLA", "A portable shelter from rain"],
  ["SANDWICH", "A filling between slices of bread"],
  ["TREASURE", "A hidden collection of valuable things"],
  ["BUTTERFLY", "An insect with colorful wings"],
  ["PLANET", "A world orbiting a star"],
  ["GARDEN", "A place to grow flowers"],
  ["BRIDGE", "A crossing over water"],
  ["ROCKET", "A vehicle for space travel"],
  ["PUZZLE", "A challenge to solve"],
  ["CASTLE", "A fortress with towers"],
  ["OCEAN", "A vast body of salt water"],
  ["FOREST", "A land filled with trees"],
  ["GUITAR", "A six-string instrument"],
  ["BASKET", "A woven container"],
  ["PENCIL", "A writing tool with graphite"],
  ["SUNSET", "When the sun slips below the horizon"],
  ["CANDLE", "A wax light with a wick"],
  ["TURTLE", "A reptile carrying a shell"],
  ["ISLAND", "Land surrounded by water"],
  ["RAINBOW", "An arc of colors after rain"],
  ["WINDOW", "A view through a wall"],
  ["ANCHOR", "Keeps a boat in place"],
  ["MAGNET", "It attracts iron"],
  ["FEATHER", "Part of a bird's coat"],
] as const;
export function pickWord(level = 1) {
  const choices = words.filter(([word]) =>
    level === 0 ? word.length <= 6 : level === 2 ? word.length >= 7 : true,
  );
  return choices[Math.floor(Math.random() * choices.length)];
}
export function scramble(word: string) {
  const mixed = shuffled([...word]).join("");
  return mixed !== word ? mixed : word.slice(1) + word[0];
}
