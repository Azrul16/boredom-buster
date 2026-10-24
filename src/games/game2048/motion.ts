// Map each original tile to its destination before committing the merged board.
export function movementTargets(
  board: number[],
  direction: number,
): Record<number, number> {
  const targets: Record<number, number> = {};
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
    const occupied = indices.filter((i) => board[i]);
    let destination = 0;
    for (let i = 0; i < occupied.length; i++) {
      targets[occupied[i]] = indices[destination];
      if (
        i + 1 < occupied.length &&
        board[occupied[i]] === board[occupied[i + 1]]
      )
        targets[occupied[++i]] = indices[destination];
      destination++;
    }
  }
  return targets;
}
