import React, { useEffect, useCallback } from 'react';
import SudokuBoard from './SudokuBoard';
import NumberPad from './NumberPad';
import { useSudokuGame } from '../hooks/useSudokuGame';
import './Game.css';

const Game: React.FC = () => {
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
  } = useSudokuGame();

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

  return (
    <div className="game-container">
      <h1>Cosmic Sudoku</h1>
      
      <div className="game-board">
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
            Launch New Mission
          </button>
        </div>
      </div>

      {isComplete && (
        <div className="game-complete">
          <h2>Stellar Achievement!</h2>
          <p>You've mastered the cosmic puzzle!</p>
          <button onClick={newGame}>Launch New Game</button>
        </div>
      )}
    </div>
  );
};

export default Game; 