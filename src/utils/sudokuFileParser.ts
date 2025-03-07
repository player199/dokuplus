import { SudokuBoard } from './sudokuUtils';

// Interface for a puzzle (no solution included)
export interface SudokuPuzzle {
  id: string;
  puzzle: SudokuBoard;
}

/**
 * Parses a text file containing Sudoku puzzles.
 * Expected format:
 * Grid XX
 * [9 rows of 9 digits, with 0 or . representing empty cells]
 * (Next grid follows immediately)
 */
export const parseSudokuFile = (fileContent: string): SudokuPuzzle[] => {
  const puzzles: SudokuPuzzle[] = [];
  console.log("Parsing puzzles file...");
  
  // Split the content by lines
  const lines = fileContent.trim().split('\n');
  
  let currentPuzzle: string[] = [];
  let currentPuzzleId = '';
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if this is a grid header
    if (line.startsWith('Grid ')) {
      // If we were processing a puzzle, finish it
      if (currentPuzzle.length === 9) {
        const puzzleBoard = parseSudokuGrid(currentPuzzle);
        if (puzzleBoard) {
          puzzles.push({
            id: currentPuzzleId,
            puzzle: puzzleBoard
          });
        }
      }
      
      // Start a new puzzle
      currentPuzzleId = line;
      currentPuzzle = [];
    } 
    // Otherwise, add the line to the current puzzle
    else if (line.length === 9) {
      currentPuzzle.push(line);
    }
  }
  
  // Process the last puzzle if there is one
  if (currentPuzzle.length === 9) {
    const puzzleBoard = parseSudokuGrid(currentPuzzle);
    if (puzzleBoard) {
      puzzles.push({
        id: currentPuzzleId,
        puzzle: puzzleBoard
      });
    }
  }
  
  console.log(`Successfully parsed ${puzzles.length} puzzles`);
  return puzzles;
};

/**
 * Parses a 9x9 grid of characters into a Sudoku board
 */
const parseSudokuGrid = (lines: string[]): SudokuBoard | null => {
  if (lines.length !== 9) {
    return null;
  }
  
  const board: SudokuBoard = [];
  
  for (let i = 0; i < 9; i++) {
    const line = lines[i].trim();
    if (line.length !== 9) {
      return null;
    }
    
    const row: (number | null)[] = [];
    
    for (let j = 0; j < 9; j++) {
      const char = line[j];
      // If character is a digit 1-9, use it. If it's 0 or ., use null
      const num = /[1-9]/.test(char) ? parseInt(char, 10) : null;
      row.push(num);
    }
    
    board.push(row);
  }
  
  return board;
};

/**
 * Loads puzzles from the public puzzles.txt file
 */
export const loadPuzzlesFromFile = async (): Promise<SudokuPuzzle[]> => {
  try {
    console.log("Loading puzzles from file...");
    const response = await fetch('puzzles.txt');
    
    if (!response.ok) {
      console.error(`Failed to load puzzles file: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const fileContent = await response.text();
    return parseSudokuFile(fileContent);
  } catch (error) {
    console.error('Error loading puzzles file:', error);
    return [];
  }
}; 