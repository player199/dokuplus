import React, { useEffect, useCallback, useState, useRef } from 'react';
import SudokuBoard from './SudokuBoard';
import NumberPad from './NumberPad';
import Timer from './Timer';
import RecordsModal from './RecordsModal';
import { useSudokuGame } from '../hooks/useSudokuGame';
import { loadPuzzlesFromFile } from '../utils/sudokuFileParser';
import { setPuzzles } from '../utils/sudokuUtils';
import { getGameRecords, saveGameRecord } from '../utils/recordsUtils';
import './Game.css';

const Game: React.FC = () => {
  const [puzzlesLoaded, setPuzzlesLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [records, setRecords] = useState(getGameRecords());
  const [isRecordsModalOpen, setIsRecordsModalOpen] = useState<boolean>(false);
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

  // Start the timer when the game starts and stop it when the game is complete
  useEffect(() => {
    if (puzzlesLoaded && !isLoading) {
      setIsTimerRunning(true);
    }
  }, [puzzlesLoaded, isLoading]);

  // Handle the completion of the game
  useEffect(() => {
    // Only handle completion if not in auto-filling mode
    if (isComplete && isTimerRunning && !isAutoFilling) {
      // Stop the timer
      setIsTimerRunning(false);
      
      // Save the record
      const newRecord = saveGameRecord(elapsedTime);
      setRecords(prevRecords => [...prevRecords, newRecord]);
    }
  }, [isComplete, isTimerRunning, elapsedTime, isAutoFilling]);

  // Reset timer when a new game is started, but not during auto-filling
  useEffect(() => {
    // Only reset the timer if:
    // 1. We have a board
    // 2. The game is not complete
    // 3. We're not in auto-filling mode (FLY mode active filling)
    if (!isComplete && board && board[0] && board[0][0] !== null && !isAutoFilling) {
      // Only reset if this is an actual board change, not initial load or auto-filling
      setElapsedTime(0);
      setIsTimerRunning(true);
    }
  }, [board, isComplete, isAutoFilling]);

  // Handle time updates from the Timer component
  const handleTimeUpdate = useCallback((time: number) => {
    setElapsedTime(time);
  }, []);

  // Handle starting a new game
  const handleNewGame = useCallback(() => {
    // Don't start a new game if auto-filling is in progress
    if (isAutoFilling) return;
    
    // First stop the current timer
    setIsTimerRunning(false);
    
    // Reset the elapsed time
    setElapsedTime(0);
    
    // Call the game reset function
    newGame();
    
    // Start the timer on the next tick to ensure proper sequence
    setTimeout(() => {
      setIsTimerRunning(true);
    }, 0);
  }, [newGame, isAutoFilling]);

  // Toggle the records modal
  const toggleRecordsModal = useCallback(() => {
    setIsRecordsModalOpen(prev => !prev);
  }, []);

  // Handle click outside the board to deselect cell
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't deselect when clicking on buttons or other interactive elements
      if (target.tagName === 'BUTTON' || 
          target.closest('button') || 
          target.closest('.number-pad') ||
          target.closest('.game-controls') ||
          target.closest('.records-modal')) {
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
      <div className="game-header">
        <h1>doku</h1>
        <div className="header-controls">
          <button className="records-button" onClick={toggleRecordsModal}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"></path>
            </svg>
            Records
          </button>
          <Timer 
            isRunning={isTimerRunning} 
            isComplete={isComplete}
            onTimeUpdate={handleTimeUpdate}
            initialTime={elapsedTime}
          />
        </div>
      </div>
      
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
            onClick={handleNewGame}
            disabled={isAutoFilling}
          >
            New Game
          </button>
        </div>
      </div>

      {isComplete && (
        <div className="game-complete">
          <h2>Puzzle Solved!</h2>
          <p>You've completed the puzzle in {formatTime(elapsedTime)}!</p>
          <button onClick={handleNewGame}>New Game</button>
        </div>
      )}

      <RecordsModal 
        records={records}
        isOpen={isRecordsModalOpen}
        onClose={toggleRecordsModal}
      />
    </div>
  );
};

// Format time for display
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const formattedHours = hours > 0 ? `${hours}h ` : '';
  const formattedMinutes = minutes > 0 ? `${minutes}m ` : '';
  const formattedSeconds = `${secs}s`;
  
  return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
};

export default Game; 