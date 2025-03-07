import React, { useEffect, useCallback, useState, useRef } from 'react';
import SudokuBoard from './SudokuBoard';
import NumberPad from './NumberPad';
import { useSudokuGame } from '../hooks/useSudokuGame';
import { loadPuzzlesFromFile } from '../utils/sudokuFileParser';
import { setPuzzles } from '../utils/sudokuUtils';
import './Game.css';

const Game: React.FC = () => {
  const [puzzlesLoaded, setPuzzlesLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Load puzzles from file on component mount
  useEffect(() => {
    const loadPuzzles = async () => {
      try {
        setIsLoading(true);
        const puzzles = await loadPuzzlesFromFile();
        
        // If we have puzzles, set them in the sudokuUtils
        if (puzzles.length > 0) {
          setPuzzles(puzzles);
          console.log(`Set ${puzzles.length} puzzles for use in the game`);
        } else {
          console.warn('No puzzles were loaded, will use default puzzle');
        }
        
        setPuzzlesLoaded(true);
      } catch (error) {
        console.error('Failed to load puzzles:', error);
        setPuzzlesLoaded(true); // Still mark as loaded so game can use default puzzle
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPuzzles();
  }, []);

  // Initialize the game state after puzzles are loaded
  const {
    board,
    selectedCell,
    isComplete,
    candidateMode,
    flyMode,
    isAutoFilling,
    inputMode,
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
  } = useSudokuGame(puzzlesLoaded);

  // Handle click outside the board to deselect cell
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't deselect when clicking on buttons or other interactive elements
      if (target.tagName === 'BUTTON' || 
          target.closest('button') || 
          target.closest('.number-pad') ||
          target.closest('.game-controls')) {
        return;
      }
      
      // Only deselect if clicking outside the board
      if (selectedCell && boardRef.current && !boardRef.current.contains(target)) {
        selectCell(-1, -1); // Use an invalid position to represent no selection
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedCell, selectCell]);

  // Handle keyboard input
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!selectedCell) return;

      // Prevent page scrolling when using arrow keys in the game
      if (event.key.startsWith('Arrow')) {
        event.preventDefault();
      }

      // Handle number inputs (1-9)
      if (/^[1-9]$/.test(event.key)) {
        setNumber(parseInt(event.key, 10));
      }
      // Handle delete or backspace for clearing a cell
      else if (event.key === 'Delete' || event.key === 'Backspace') {
        clearCell();
      }
      // Toggle input mode with Tab key
      else if (event.key === 'Tab') {
        event.preventDefault();
        setInputMode(inputMode === 'normal' ? 'candidate' : 'normal');
      }
      // Handle arrow keys for navigation
      else if (event.key.startsWith('Arrow')) {
        const [row, col] = selectedCell;
        let newRow = row;
        let newCol = col;

        switch (event.key) {
          case 'ArrowUp':
            newRow = Math.max(0, row - 1);
            break;
          case 'ArrowDown':
            newRow = Math.min(8, row + 1);
            break;
          case 'ArrowLeft':
            newCol = Math.max(0, col - 1);
            break;
          case 'ArrowRight':
            newCol = Math.min(8, col + 1);
            break;
        }

        if (newRow !== row || newCol !== col) {
          selectCell(newRow, newCol);
        }
      }
    },
    [selectedCell, setNumber, clearCell, selectCell, inputMode, setInputMode]
  );

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="game-container">
        <h1>doku</h1>
        <div className="loading-message">Loading puzzles...</div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <h1>doku</h1>
      
      <div className="game-board">
        <div ref={boardRef}>
          <SudokuBoard
            board={board}
            selectedCell={selectedCell}
            isFixedCell={isFixedCell}
            hasConflict={hasConflict}
            onCellClick={selectCell}
            onCandidateClick={toggleCellCandidate}
            getNotesForCell={getNotesForCell}
            getCandidatesForCell={getCandidatesForCell}
            candidateMode={candidateMode}
            isAutoFilling={isAutoFilling}
          />
        </div>
        
        <div className="game-controls">
          <NumberPad
            onNumberClick={setNumber}
            onClearClick={clearCell}
            candidateMode={candidateMode}
            flyMode={flyMode}
            inputMode={inputMode}
            onToggleCandidateMode={toggleCandidateMode}
            onToggleFlyMode={toggleFlyMode}
            setInputMode={setInputMode}
            disabled={isAutoFilling}
          />
          
          <button 
            className="new-game-button" 
            onClick={newGame}
            disabled={isAutoFilling}
          >
            New Game
          </button>
        </div>
      </div>

      {isComplete && (
        <div className="game-complete">
          <h2>Puzzle Solved!</h2>
          <p>You've completed the puzzle!</p>
          <button onClick={newGame}>New Game</button>
        </div>
      )}
    </div>
  );
};

export default Game; 