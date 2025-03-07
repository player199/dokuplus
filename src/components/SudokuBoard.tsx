import React from 'react';
import SudokuCell from './SudokuCell';
import './SudokuBoard.css';
import { SudokuBoard as SudokuBoardType } from '../utils/sudokuUtils';

interface SudokuBoardProps {
  board: SudokuBoardType;
  selectedCell: [number, number] | null;
  isFixedCell: (row: number, col: number) => boolean;
  hasConflict: (row: number, col: number) => boolean;
  onCellClick: (row: number, col: number) => void;
  onCandidateClick: (row: number, col: number, num: number) => void;
  getNotesForCell: (row: number, col: number) => number[];
  getCandidatesForCell: (row: number, col: number) => number[];
  candidateMode: boolean;
}

const SudokuBoard: React.FC<SudokuBoardProps> = ({
  board,
  selectedCell,
  isFixedCell,
  hasConflict,
  onCellClick,
  onCandidateClick,
  getNotesForCell,
  getCandidatesForCell,
  candidateMode,
}) => {
  return (
    <div className="sudoku-board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((cell, colIndex) => (
            <SudokuCell
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              row={rowIndex}
              col={colIndex}
              isSelected={
                selectedCell !== null &&
                selectedCell[0] === rowIndex &&
                selectedCell[1] === colIndex
              }
              isFixed={isFixedCell(rowIndex, colIndex)}
              hasConflict={hasConflict(rowIndex, colIndex)}
              notes={getNotesForCell(rowIndex, colIndex)}
              candidates={getCandidatesForCell(rowIndex, colIndex)}
              showCandidates={candidateMode}
              onClick={onCellClick}
              onCandidateClick={onCandidateClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SudokuBoard; 