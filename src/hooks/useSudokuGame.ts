import { useState, useCallback, useEffect } from 'react';
import { 
  SudokuBoard, 
  generateSudokuPuzzle, 
  isValidPlacement, 
  isBoardComplete 
} from '../utils/sudokuUtils';

interface SudokuGameState {
  board: SudokuBoard;
  originalBoard: SudokuBoard;
  solution: SudokuBoard;
  selectedCell: [number, number] | null;
  isComplete: boolean;
  notes: Map<string, number[]>;
  conflicts: Map<string, boolean>; // Track cells that have conflicts
  candidateMode: boolean; // Track if candidate mode is active
  flyMode: boolean; // Track if FLY mode is active
  isAutoFilling: boolean; // Track if auto-filling is in progress
  autoCandidates: Map<string, number[]>; // Store automatically calculated candidates
  userCandidates: Map<string, number[]>; // Store user-modified candidates
  inputMode: 'normal' | 'candidate'; // Input mode for numpad
}

export const useSudokuGame = () => {
  const { puzzle, solution } = generateSudokuPuzzle();
  
  const [gameState, setGameState] = useState<SudokuGameState>({
    board: JSON.parse(JSON.stringify(puzzle)),
    originalBoard: JSON.parse(JSON.stringify(puzzle)),
    solution,
    selectedCell: null,
    isComplete: false,
    notes: new Map<string, number[]>(),
    conflicts: new Map<string, boolean>(),
    candidateMode: false,
    flyMode: false,
    isAutoFilling: false,
    autoCandidates: new Map<string, number[]>(),
    userCandidates: new Map<string, number[]>(),
    inputMode: 'normal',
  });

  // Calculate all possible candidates for a cell
  const calculateCandidates = useCallback((board: SudokuBoard, row: number, col: number): number[] => {
    if (board[row][col] !== null) return [];
    
    const candidates = [];
    for (let num = 1; num <= 9; num++) {
      if (isValidPlacement(board, row, col, num)) {
        candidates.push(num);
      }
    }
    return candidates;
  }, []);

  // Calculate candidates for all empty cells
  const calculateAllCandidates = useCallback((board: SudokuBoard): Map<string, number[]> => {
    const allCandidates = new Map<string, number[]>();
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === null) {
          const cellKey = `${row},${col}`;
          allCandidates.set(cellKey, calculateCandidates(board, row, col));
        }
      }
    }
    
    return allCandidates;
  }, [calculateCandidates]);

  // Helper to check for conflicts in the entire board
  const checkAllConflicts = useCallback((board: SudokuBoard) => {
    const newConflicts = new Map<string, boolean>();
    
    // Check each cell for conflicts
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = board[row][col];
        if (value === null) continue;
        
        // Check if this value conflicts with any other cell
        const hasConflict = !isValidValue(board, row, col, value);
        if (hasConflict) {
          newConflicts.set(`${row},${col}`, true);
        }
      }
    }
    
    return newConflicts;
  }, []);

  // Check if a cell's value creates conflicts
  const isValidValue = useCallback((board: SudokuBoard, row: number, col: number, num: number): boolean => {
    // Temporarily remove the value from the board for checking
    const value = board[row][col];
    board[row][col] = null;
    const isValid = isValidPlacement(board, row, col, num);
    // Restore the value
    board[row][col] = value;
    return isValid;
  }, []);

  // Check if a cell has a conflict
  const hasConflict = useCallback((row: number, col: number): boolean => {
    return gameState.conflicts.has(`${row},${col}`);
  }, [gameState.conflicts]);

  // Get effective candidates for a cell (user-modified if available, otherwise auto)
  const getEffectiveCandidates = useCallback((row: number, col: number): number[] => {
    const cellKey = `${row},${col}`;
    const userCandidates = gameState.userCandidates.get(cellKey);
    
    // If user has modified candidates for this cell, use those
    if (userCandidates !== undefined) {
      return userCandidates;
    }
    
    // Otherwise, use auto candidates
    return gameState.autoCandidates.get(cellKey) || [];
  }, [gameState.userCandidates, gameState.autoCandidates]);

  // Select a cell on the board
  const selectCell = useCallback((row: number, col: number) => {
    setGameState((prev) => ({
      ...prev,
      selectedCell: [row, col],
    }));
  }, []);

  // Check if a cell is part of the original puzzle (fixed)
  const isFixedCell = useCallback((row: number, col: number): boolean => {
    return gameState.originalBoard[row][col] !== null;
  }, [gameState.originalBoard]);

  // Set input mode directly
  const setInputMode = useCallback((mode: 'normal' | 'candidate') => {
    setGameState((prev) => ({
      ...prev,
      inputMode: mode,
    }));
  }, []);

  // Toggle a number in notes or candidates when clicking directly on the number in a cell
  const toggleCellCandidate = useCallback((row: number, col: number, num: number) => {
    if (gameState.board[row][col] !== null || isFixedCell(row, col)) return;
    
    const cellKey = `${row},${col}`;
    
    if (gameState.candidateMode) {
      // Toggle in user candidates
      setGameState((prev) => {
        // Get current user candidates for this cell, or auto candidates if not modified yet
        const currentUserCandidates = prev.userCandidates.get(cellKey) || 
                                     prev.autoCandidates.get(cellKey) || [];
        
        // Toggle the number
        let newUserCandidates: number[];
        if (currentUserCandidates.includes(num)) {
          newUserCandidates = currentUserCandidates.filter(n => n !== num);
        } else {
          newUserCandidates = [...currentUserCandidates, num].sort();
        }
        
        // Update user candidates
        const newUserCandidatesMap = new Map(prev.userCandidates);
        newUserCandidatesMap.set(cellKey, newUserCandidates);
        
        return {
          ...prev,
          userCandidates: newUserCandidatesMap
        };
      });
    } else {
      // Toggle in notes
      setGameState((prev) => {
        const currentNotes = prev.notes.get(cellKey) || [];
        
        // Toggle the number
        let newNotes: number[];
        if (currentNotes.includes(num)) {
          newNotes = currentNotes.filter(n => n !== num);
        } else {
          newNotes = [...currentNotes, num].sort();
        }
        
        // Update notes
        const newNotes2 = new Map(prev.notes);
        newNotes2.set(cellKey, newNotes);
        
        return {
          ...prev,
          notes: newNotes2
        };
      });
    }
  }, [gameState.board, gameState.candidateMode, isFixedCell]);

  // Auto-fill cells with only one candidate (FLY mode)
  const autoFillSingleCandidates = useCallback((
    board: SudokuBoard, 
    candidates: Map<string, number[]>,
    userCandidatesMap: Map<string, number[]>
  ): { 
    updatedBoard: SudokuBoard, 
    changedSomething: boolean,
    updatedUserCandidates: Map<string, number[]>
  } => {
    const newBoard = JSON.parse(JSON.stringify(board));
    const newUserCandidates = new Map(userCandidatesMap);
    let changedSomething = false;

    // Find all cells with only one candidate
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (newBoard[row][col] === null) {
          const cellKey = `${row},${col}`;
          // Use user candidates if available, otherwise use auto candidates
          const cellCandidates = newUserCandidates.get(cellKey) || candidates.get(cellKey) || [];
          
          if (cellCandidates.length === 1) {
            // Fill the cell with the single candidate
            newBoard[row][col] = cellCandidates[0];
            // Clear candidates for this cell
            newUserCandidates.delete(cellKey);
            changedSomething = true;
          }
        }
      }
    }
    
    return { 
      updatedBoard: newBoard, 
      changedSomething,
      updatedUserCandidates: newUserCandidates
    };
  }, []);

  // Add a new function to find a single candidate cell
  const findSingleCandidateCell = useCallback((
    board: SudokuBoard, 
    candidates: Map<string, number[]>,
    userCandidatesMap: Map<string, number[]>
  ): { 
    found: boolean, 
    row: number, 
    col: number, 
    value: number 
  } => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === null) {
          const cellKey = `${row},${col}`;
          // Use user candidates if available, otherwise use auto candidates
          const cellCandidates = userCandidatesMap.get(cellKey) || candidates.get(cellKey) || [];
          
          if (cellCandidates.length === 1) {
            return { 
              found: true, 
              row, 
              col, 
              value: cellCandidates[0] 
            };
          }
        }
      }
    }
    return { found: false, row: -1, col: -1, value: -1 };
  }, []);

  // Add a function to fill a single cell with delay
  const fillSingleCell = useCallback((
    row: number, 
    col: number, 
    value: number
  ) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setGameState(prev => {
          const newBoard = JSON.parse(JSON.stringify(prev.board));
          
          // Fill the cell with the value
          newBoard[row][col] = value;
          
          // Clear user candidates for this cell
          const newUserCandidates = new Map(prev.userCandidates);
          newUserCandidates.delete(`${row},${col}`);
          
          // Recalculate auto candidates
          const newAutoCandidates = calculateAllCandidates(newBoard);
          
          // Check for conflicts
          const newConflicts = checkAllConflicts(newBoard);
          
          // Check if complete
          const complete = newConflicts.size === 0 && isBoardComplete(newBoard);
          
          return {
            ...prev,
            board: newBoard,
            userCandidates: newUserCandidates,
            autoCandidates: newAutoCandidates,
            conflicts: newConflicts,
            isComplete: complete
          };
        });
        resolve();
      }, 500); // 0.5 second delay
    });
  }, [calculateAllCandidates, checkAllConflicts]);

  // Add a helper function to properly access current state
  const getCurrentGameState = useCallback(() => {
    return new Promise<SudokuGameState>((resolve) => {
      setGameState(prev => {
        resolve(prev);
        return prev;
      });
    });
  }, []);

  // Update the startAnimatedFlyMode function
  const startAnimatedFlyMode = useCallback(async () => {
    // Set auto-filling flag to true
    setGameState(prev => ({ ...prev, isAutoFilling: true }));
    
    let continueProcessing = true;
    
    while (continueProcessing) {
      // Get the current state to work with latest data
      const currentState = await getCurrentGameState();
      
      // Find a cell with only one candidate
      const { found, row, col, value } = findSingleCandidateCell(
        currentState.board, 
        currentState.autoCandidates, 
        currentState.userCandidates
      );
      
      if (found) {
        // Fill this cell with a delay
        await fillSingleCell(row, col, value);
      } else {
        // No more cells to fill
        continueProcessing = false;
      }
    }
    
    // Set auto-filling flag back to false
    setGameState(prev => ({ ...prev, isAutoFilling: false }));
  }, [findSingleCandidateCell, fillSingleCell, getCurrentGameState]);

  // Set a number in the selected cell
  const setNumber = useCallback((num: number) => {
    if (!gameState.selectedCell) return;
    if (gameState.isAutoFilling) return; // Don't allow input during auto-filling

    const [row, col] = gameState.selectedCell;

    // Don't allow modifying fixed cells
    if (isFixedCell(row, col)) return;
    
    const cellKey = `${row},${col}`;

    if (gameState.inputMode === 'candidate') {
      // Handle candidate input mode (for both notes and candidates)
      if (gameState.candidateMode) {
        // Toggle in user candidates
        setGameState((prev) => {
          // Get current user candidates for this cell, or auto candidates if not modified yet
          const currentUserCandidates = prev.userCandidates.get(cellKey) || 
                                      prev.autoCandidates.get(cellKey) || [];
          
          // Toggle the number
          let newUserCandidates: number[];
          if (currentUserCandidates.includes(num)) {
            newUserCandidates = currentUserCandidates.filter(n => n !== num);
          } else {
            newUserCandidates = [...currentUserCandidates, num].sort();
          }
          
          // Update user candidates
          const newUserCandidatesMap = new Map(prev.userCandidates);
          newUserCandidatesMap.set(cellKey, newUserCandidates);
          
          return {
            ...prev,
            userCandidates: newUserCandidatesMap
          };
        });
      } else {
        // Toggle in notes
        setGameState((prev) => {
          const currentNotes = prev.notes.get(cellKey) || [];
          
          // Toggle the number
          let newNotes: number[];
          if (currentNotes.includes(num)) {
            newNotes = currentNotes.filter(n => n !== num);
          } else {
            newNotes = [...currentNotes, num].sort();
          }
          
          // Update notes
          const newNotes2 = new Map(prev.notes);
          newNotes2.set(cellKey, newNotes);
          
          return {
            ...prev,
            notes: newNotes2
          };
        });
      }
    } else {
      // Handle normal input mode (direct number entry)
      setGameState((prev) => {
        const newBoard = JSON.parse(JSON.stringify(prev.board));
        const newValue = num === 0 ? null : num;
        
        // Set the new value on the board
        newBoard[row][col] = newValue;

        // Clear notes for this cell when a number is placed
        const newNotes = new Map(prev.notes);
        newNotes.delete(`${row},${col}`);
        
        // Clear user candidates for this cell
        const newUserCandidates = new Map(prev.userCandidates);
        newUserCandidates.delete(`${row},${col}`);
        
        // Recalculate all conflicts on the board
        const newConflicts = checkAllConflicts(newBoard);
        
        // Recalculate candidates since the board changed
        const newAutoCandidates = calculateAllCandidates(newBoard);

        // Check if the game is complete (no conflicts and no empty cells)
        const complete = newConflicts.size === 0 && isBoardComplete(newBoard);

        const result = {
          ...prev,
          board: newBoard,
          isComplete: complete,
          notes: newNotes,
          conflicts: newConflicts,
          autoCandidates: newAutoCandidates,
          userCandidates: newUserCandidates
        };

        // If FLY mode is active, start the animated filling process
        if (prev.flyMode && prev.candidateMode && newConflicts.size === 0) {
          // Start the animated filling process on the next tick
          setTimeout(() => {
            startAnimatedFlyMode();
          }, 10);
        }

        return result;
      });
    }
  }, [
    gameState.selectedCell, 
    gameState.inputMode,
    gameState.candidateMode,
    gameState.flyMode,
    gameState.isAutoFilling,
    isFixedCell,
    calculateAllCandidates,
    checkAllConflicts,
    startAnimatedFlyMode
  ]);

  // Clear the selected cell
  const clearCell = useCallback(() => {
    if (!gameState.selectedCell) return;

    const [row, col] = gameState.selectedCell;
    
    // Don't allow clearing fixed cells
    if (isFixedCell(row, col)) return;

    setGameState((prev) => {
      const newBoard = JSON.parse(JSON.stringify(prev.board));
      newBoard[row][col] = null;
      
      // Clear notes for this cell as well
      const newNotes = new Map(prev.notes);
      newNotes.delete(`${row},${col}`);
      
      // Clear user candidates for this cell
      const newUserCandidates = new Map(prev.userCandidates);
      newUserCandidates.delete(`${row},${col}`);

      // Recalculate conflicts
      const newConflicts = checkAllConflicts(newBoard);
      
      // Recalculate candidates since the board changed
      const newAutoCandidates = calculateAllCandidates(newBoard);

      return {
        ...prev,
        board: newBoard,
        notes: newNotes,
        conflicts: newConflicts,
        autoCandidates: newAutoCandidates,
        userCandidates: newUserCandidates
      };
    });
  }, [gameState.selectedCell, isFixedCell, checkAllConflicts, calculateAllCandidates]);

  // Toggle candidate mode
  const toggleCandidateMode = useCallback(() => {
    setGameState((prev) => {
      const newCandidateMode = !prev.candidateMode;
      // If turning on candidate mode, calculate all candidates
      const newAutoCandidates = newCandidateMode 
        ? calculateAllCandidates(prev.board)
        : prev.autoCandidates;
        
      return {
        ...prev,
        candidateMode: newCandidateMode,
        autoCandidates: newAutoCandidates,
        // Also switch to candidate input mode when candidate mode is activated
        inputMode: newCandidateMode ? 'candidate' : prev.inputMode
      };
    });
  }, [calculateAllCandidates]);

  // Toggle the FLY mode
  const toggleFlyMode = useCallback(() => {
    if (!gameState.candidateMode) return; // Only allow FLY mode when candidate mode is active
    if (gameState.isAutoFilling) return; // Don't allow toggling during auto-filling
    
    setGameState((prev) => {
      const newFlyMode = !prev.flyMode;
      
      // If turning FLY mode on, immediately start the animated filling
      if (newFlyMode) {
        // Start the animated filling on the next tick
        setTimeout(() => {
          startAnimatedFlyMode();
        }, 10);
      }
      
      return {
        ...prev,
        flyMode: newFlyMode
      };
    });
  }, [gameState.candidateMode, gameState.isAutoFilling, startAnimatedFlyMode]);

  // Start a new game
  const newGame = useCallback(() => {
    const { puzzle: newPuzzle, solution: newSolution } = generateSudokuPuzzle();
    setGameState({
      board: JSON.parse(JSON.stringify(newPuzzle)),
      originalBoard: JSON.parse(JSON.stringify(newPuzzle)),
      solution: newSolution,
      selectedCell: null,
      isComplete: false,
      notes: new Map<string, number[]>(),
      conflicts: new Map<string, boolean>(),
      candidateMode: false,
      flyMode: false,
      isAutoFilling: false,
      autoCandidates: new Map<string, number[]>(),
      userCandidates: new Map<string, number[]>(),
      inputMode: 'normal',
    });
  }, []);

  // Get notes for a specific cell
  const getNotesForCell = useCallback((row: number, col: number): number[] => {
    return gameState.notes.get(`${row},${col}`) || [];
  }, [gameState.notes]);
  
  // Get candidates for a specific cell (user-modified if available, otherwise auto)
  const getCandidatesForCell = useCallback((row: number, col: number): number[] => {
    return getEffectiveCandidates(row, col);
  }, [getEffectiveCandidates]);

  // Update auto candidates when the board changes
  useEffect(() => {
    setGameState(prev => {
      const newConflicts = checkAllConflicts(prev.board);
      
      // Only recalculate candidates if candidate mode is active
      const newAutoCandidates = prev.candidateMode
        ? calculateAllCandidates(prev.board)
        : prev.autoCandidates;
        
      return {
        ...prev,
        conflicts: newConflicts,
        autoCandidates: newAutoCandidates
      };
    });
  }, [checkAllConflicts, calculateAllCandidates]);

  return {
    board: gameState.board,
    selectedCell: gameState.selectedCell,
    isComplete: gameState.isComplete,
    candidateMode: gameState.candidateMode,
    flyMode: gameState.flyMode,
    isAutoFilling: gameState.isAutoFilling,
    inputMode: gameState.inputMode,
    selectCell,
    setNumber,
    clearCell,
    toggleCandidateMode,
    toggleFlyMode,
    toggleCellCandidate,
    setInputMode,
    newGame,
    isFixedCell,
    getNotesForCell,
    getCandidatesForCell,
    hasConflict,
  };
}; 