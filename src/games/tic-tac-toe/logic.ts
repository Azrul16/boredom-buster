export type Mark = "X" | "O" | null;
export const lines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
export function winner(board: Mark[]) {
  return lines.find(
    (line) => board[line[0]] && line.every((i) => board[i] === board[line[0]]),
  );
}
function minimax(board: Mark[], max: boolean): number {
  const win = winner(board);
  if (win) return board[win[0]] === "O" ? 10 : -10;
  if (board.every(Boolean)) return 0;
  const scores = board.flatMap((cell, i) => {
    if (cell) return [];
    const next = [...board];
    next[i] = max ? "O" : "X";
    return [minimax(next, !max)];
  });
  return max ? Math.max(...scores) : Math.min(...scores);
}
export function bestMove(board: Mark[]) {
  let score = -Infinity,
    move = -1;
  board.forEach((cell, i) => {
    if (cell) return;
    const next = [...board];
    next[i] = "O";
    const value = minimax(next, false);
    if (value > score) {
      score = value;
      move = i;
    }
  });
  return move;
}
