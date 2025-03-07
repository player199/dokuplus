import { SudokuPuzzle } from './sudokuFileParser';

// Sudoku board type definition
export type SudokuBoard = (number | null)[][];

// Function to check if a number placement is valid
export const isValidPlacement = (
  board: SudokuBoard,
  row: number,
  col: number,
  num: number
): boolean => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }

  return true;
};

// Function to check if the Sudoku board is complete and valid
export const isBoardComplete = (board: SudokuBoard): boolean => {
  // Check if there are any empty cells
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) return false;
    }
  }

  // Since we validate each move as the player enters it,
  // if there are no empty cells, the board is complete
  return true;
};

// Generate an empty Sudoku board
export const createEmptyBoard = (): SudokuBoard => {
  return Array(9).fill(null).map(() => Array(9).fill(null));
};

// Default puzzle to use if no puzzles are loaded
const defaultPuzzle: SudokuPuzzle = {
  id: "DefaultGrid",
  puzzle: [
    [5, 3, null, null, 7, null, null, null, null],
    [6, null, null, 1, 9, 5, null, null, null],
    [null, 9, 8, null, null, null, null, 6, null],
    [8, null, null, null, 6, null, null, null, 3],
    [4, null, null, 8, null, 3, null, null, 1],
    [7, null, null, null, 2, null, null, null, 6],
    [null, 6, null, null, null, null, 2, 8, null],
    [null, null, null, 4, 1, 9, null, null, 5],
    [null, null, null, null, 8, null, null, 7, 9]
  ]
};

// Loaded puzzles will be stored here after initialization
let loadedPuzzles: SudokuPuzzle[] = [];

// Set loaded puzzles
export const setPuzzles = (puzzles: SudokuPuzzle[]): void => {
  loadedPuzzles = puzzles;
};

// Solve a Sudoku puzzle
export const solveSudoku = (board: SudokuBoard): SudokuBoard | null => {
  const solution = JSON.parse(JSON.stringify(board)) as SudokuBoard;
  
  if (solveBoard(solution)) {
    return solution;
  }
  return null;
};

// Helper function for solving Sudoku (backtracking algorithm)
const solveBoard = (board: SudokuBoard): boolean => {
  // Find an empty cell
  let emptyCell = findEmptyCell(board);
  if (!emptyCell) {
    // No empty cells means the puzzle is solved
    return true;
  }
  
  const [row, col] = emptyCell;
  
  // Try each number 1-9
  for (let num = 1; num <= 9; num++) {
    if (isValidPlacement(board, row, col, num)) {
      // If valid, place the number
      board[row][col] = num;
      
      // Recursively try to solve the rest of the puzzle
      if (solveBoard(board)) {
        return true;
      }
      
      // If we get here, the current placement didn't work, so backtrack
      board[row][col] = null;
    }
  }
  
  // If we tried all numbers and none worked, this puzzle is unsolvable
  return false;
};

// Find an empty cell in the board
const findEmptyCell = (board: SudokuBoard): [number, number] | null => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        return [row, col];
      }
    }
  }
  return null;
};

// Function to generate a Sudoku puzzle by randomly selecting from available puzzles
export const generateSudokuPuzzle = (): { puzzle: SudokuBoard, solution: SudokuBoard } => {
  // If we have loaded puzzles, use one of them
  if (loadedPuzzles.length > 0) {
    // Randomly select one of the loaded puzzles
    const randomIndex = Math.floor(Math.random() * loadedPuzzles.length);
    const selectedPuzzle = loadedPuzzles[randomIndex];
    
    // Create deep copies to prevent mutations
    const puzzleCopy = JSON.parse(JSON.stringify(selectedPuzzle.puzzle));
    
    // Since we don't have a solution in the file, solve it programmatically
    const solutionCopy = solveSudoku(puzzleCopy);
    
    if (solutionCopy) {
      return {
        puzzle: puzzleCopy,
        solution: solutionCopy
      };
    }
    
    console.warn(`Selected puzzle ${selectedPuzzle.id} could not be solved, using default`);
  }
  
  // If no puzzles loaded or the puzzle couldn't be solved, use the default puzzle
  // For the default puzzle, compute its solution
  const puzzleCopy = JSON.parse(JSON.stringify(defaultPuzzle.puzzle));
  const solutionCopy = solveSudoku(puzzleCopy) || createEmptyBoard();
  
  return {
    puzzle: puzzleCopy,
    solution: solutionCopy
  };
}; 