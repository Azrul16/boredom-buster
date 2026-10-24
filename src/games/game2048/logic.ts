export type Board = number[];
export function slide(board: Board, direction: number) {
  const next = Array<number>(16).fill(0);
  let score = 0;
  for (let lane = 0; lane < 4; lane++) {
    const indices = Array.from({ length: 4 }, (_, j) =>
      direction === 0
        ? j * 4 + lane
        : direction === 1
          ? lane * 4 + 3 - j
          : direction === 2
            ? (3 - j) * 4 + lane
            : lane * 4 + j,
    );
    const values = indices.map((i) => board[i]).filter(Boolean);
    const result: number[] = [];
    for (let i = 0; i < values.length; i++) {
      if (values[i] === values[i + 1]) {
        result.push(values[i] * 2);
        score += values[i] * 2;
        i++;
      } else result.push(values[i]);
    }
    indices.forEach((index, j) => (next[index] = result[j] || 0));
  }
  return { board: next, score, changed: next.some((v, i) => v !== board[i]) };
}
export function spawn(board: Board, fourChance = 0.1) {
  const empty = board.flatMap((v, i) => (v ? [] : [i]));
  if (!empty.length) return board;
  const next = [...board];
  next[empty[Math.floor(Math.random() * empty.length)]] =
    Math.random() < 1 - fourChance ? 2 : 4;
  return next;
}
export function canMove(board: Board) {
  return [0, 1, 2, 3].some((d) => slide(board, d).changed);
}
