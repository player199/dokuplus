import React, { useState } from 'react';
import './SudokuCell.css';

interface SudokuCellProps {
  value: number | null;
  row: number;
  col: number;
  isSelected: boolean;
  isFixed: boolean;
  hasConflict: boolean;
  notes: number[];
  candidates: number[];
  showCandidates: boolean;
  onClick: (row: number, col: number) => void;
  onCandidateClick: (row: number, col: number, num: number) => void;
}

const SudokuCell: React.FC<SudokuCellProps> = ({
  value,
  row,
  col,
  isSelected,
  isFixed,
  hasConflict,
  notes,
  candidates,
  showCandidates,
  onClick,
  onCandidateClick,
}) => {
  // State to track which number is being hovered
  const [hoveredNumber, setHoveredNumber] = useState<number | null>(null);

  // Determine CSS classes for the cell
  const cellClasses = [
    'sudoku-cell',
    isSelected ? 'selected' : '',
    isFixed ? 'fixed' : '',
    hasConflict ? 'conflict' : '',
    // Add special styling for cells at borders of 3x3 boxes
    col % 3 === 2 && col !== 8 ? 'right-border' : '',
    row % 3 === 2 && row !== 8 ? 'bottom-border' : '',
  ].filter(Boolean).join(' ');

  // Handle cell click
  const handleClick = () => {
    onClick(row, col);
  };

  // Handle clicking on a specific note/candidate number
  const handleCandidateClick = (e: React.MouseEvent, num: number) => {
    // Only allow clicking on candidates if the cell is selected
    if (!isSelected) {
      // If not selected, select the cell first
      onClick(row, col);
      return;
    }
    
    e.stopPropagation(); // Prevent selecting the cell again
    onCandidateClick(row, col, num);
  };

  // Handle hover events for candidates
  const handleCandidateMouseEnter = (num: number) => {
    // Only show hover effect if the cell is selected
    if (isSelected) {
      setHoveredNumber(num);
    }
  };

  const handleCandidateMouseLeave = () => {
    setHoveredNumber(null);
  };

  // Render notes if there's no value and we're not in candidate mode
  const renderNotes = () => {
    // Don't render notes if the cell has a value or we're showing candidates
    if (value !== null || showCandidates) return null;

    // Create a 3x3 grid for notes
    return (
      <div className="notes-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const isVisible = notes.includes(num);
          const isHovered = hoveredNumber === num && isSelected;
          const noteClasses = [
            'note',
            isVisible ? 'visible' : '',
            isHovered ? 'hovered' : '',
            isSelected ? 'cell-selected' : '',
          ].filter(Boolean).join(' ');

          return (
            <div 
              key={num} 
              className={noteClasses}
              onClick={(e) => handleCandidateClick(e, num)}
              onMouseEnter={() => handleCandidateMouseEnter(num)}
              onMouseLeave={handleCandidateMouseLeave}
            >
              {isVisible || isHovered ? num : ''}
            </div>
          );
        })}
      </div>
    );
  };

  // Render candidates if there's no value and candidate mode is active
  const renderCandidates = () => {
    if (value !== null || !showCandidates) return null;

    // Create a 3x3 grid for candidates
    return (
      <div className="candidates-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const isVisible = candidates.includes(num);
          const isHovered = hoveredNumber === num && isSelected;
          const candidateClasses = [
            'candidate',
            isVisible ? 'visible' : '',
            isHovered ? 'hovered' : '',
            isSelected ? 'cell-selected' : '',
          ].filter(Boolean).join(' ');

          return (
            <div 
              key={num} 
              className={candidateClasses}
              onClick={(e) => handleCandidateClick(e, num)}
              onMouseEnter={() => handleCandidateMouseEnter(num)}
              onMouseLeave={handleCandidateMouseLeave}
            >
              {isVisible || isHovered ? num : ''}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cellClasses} onClick={handleClick}>
      {value ? (
        <span className="cell-value">{value}</span>
      ) : (
        <>
          {renderNotes()}
          {renderCandidates()}
        </>
      )}
      {hasConflict && <div className="conflict-indicator"></div>}
    </div>
  );
};

export default SudokuCell; 