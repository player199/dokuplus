import React from 'react';
import './NumberPad.css';

interface NumberPadProps {
  onNumberClick: (num: number) => void;
  onClearClick: () => void;
  candidateMode: boolean;
  inputMode: 'normal' | 'candidate';
  onToggleCandidateMode: () => void;
  setInputMode: (mode: 'normal' | 'candidate') => void;
  flyMode: boolean;
  onToggleFlyMode: () => void;
  canUndoFlySession: boolean;
  onUndoFlySession: () => void;
  disabled?: boolean;
}

const NumberPad: React.FC<NumberPadProps> = ({
  onNumberClick,
  onClearClick,
  candidateMode,
  inputMode,
  onToggleCandidateMode,
  setInputMode,
  flyMode,
  onToggleFlyMode,
  canUndoFlySession,
  onUndoFlySession,
  disabled = false,
}) => {
  return (
    <div className={`number-pad ${disabled ? 'disabled' : ''}`}>
      <div className="input-mode-buttons">
        <button
          className={`mode-button normal-button ${inputMode === 'normal' ? 'active' : ''}`}
          onClick={() => setInputMode('normal')}
          disabled={disabled}
        >
          Normal
        </button>
        <button
          className={`mode-button candidate-button ${inputMode === 'candidate' ? 'active' : ''}`}
          onClick={() => setInputMode('candidate')}
          disabled={disabled}
        >
          Notes
        </button>
      </div>
      <div className="number-buttons">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            className="number-button"
            onClick={() => onNumberClick(num)}
            disabled={disabled}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="control-buttons">
        <button
          className={`auto-candidate-button ${candidateMode ? 'active' : ''}`}
          onClick={onToggleCandidateMode}
          disabled={disabled}
        >
          Candidates
        </button>
        <button 
          className="clear-button" 
          onClick={onClearClick}
          disabled={disabled}
        >
          Clear
        </button>
      </div>
      <div className="fly-button-container">
        <button
          className={`fly-button ${flyMode ? 'active' : ''}`}
          onClick={onToggleFlyMode}
          disabled={!candidateMode || disabled}
          title={!candidateMode ? "Candidates must be active to use FLY mode" : "Auto-fill cells with only one candidate"}
        >
          <svg className="airplane-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M21,16V14L13,9V3.5A1.5,1.5,0,0,0,11.5,2h0A1.5,1.5,0,0,0,10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5Z"/>
          </svg>
          FLY
        </button>
        <button
          className="undo-fly-button"
          onClick={onUndoFlySession}
          disabled={!canUndoFlySession || disabled}
          title={!canUndoFlySession ? "No FLY mode session to undo" : "Undo the most recent FLY mode session"}
        >
          <svg className="undo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z"/>
          </svg>
          Undo FLY
        </button>
      </div>
    </div>
  );
};

export default NumberPad;  