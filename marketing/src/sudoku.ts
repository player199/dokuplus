// A single solved board reused across every composition so the art is
// internally consistent. This is the canonical sudoku solution.
export const SOLUTION: number[] = [
  5, 3, 4, 6, 7, 8, 9, 1, 2,
  6, 7, 2, 1, 9, 5, 3, 4, 8,
  1, 9, 8, 3, 4, 2, 5, 6, 7,
  8, 5, 9, 7, 6, 1, 4, 2, 3,
  4, 2, 6, 8, 5, 3, 7, 9, 1,
  7, 1, 3, 9, 2, 4, 8, 5, 6,
  9, 6, 1, 5, 3, 7, 2, 8, 4,
  2, 8, 7, 4, 1, 9, 6, 3, 5,
  3, 4, 5, 2, 8, 6, 1, 7, 9,
];

export const rowOf = (i: number) => Math.floor(i / 9);
export const colOf = (i: number) => i % 9;
// Normalized center of a cell within the board square (0..1 on each axis).
export const centerOf = (i: number) => ({ x: (colOf(i) + 0.5) / 9, y: (rowOf(i) + 0.5) / 9 });

// The flight path: the cells the jet lands, bottom-left -> top-right, in order.
// row*9+col for (8,1) (7,3) (6,2) (5,4) (4,3) (4,6) (3,5) (2,6) (1,4) (1,7) (0,5) (0,8)
export const ROUTE: number[] = [73, 66, 56, 49, 39, 42, 32, 24, 13, 16, 5, 8];

// A few empty cells with pencil candidates, for the "real gameplay" poster.
export const NOTE_CELLS: Record<number, number[]> = {
  20: [2, 5, 7],
  29: [1, 4],
  38: [3, 6, 9],
  60: [2, 8],
};
