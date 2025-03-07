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
          Auto Notes
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
          title={!candidateMode ? "Auto Notes must be active to use FLY mode" : "Auto-fill cells with only one candidate"}
        >
          <svg className="airplane-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M21,16V14L13,9V3.5A1.5,1.5,0,0,0,11.5,2h0A1.5,1.5,0,0,0,10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5Z"/>
          </svg>
          FLY
        </button>
      </div>
    </div>
  );
};

export default NumberPad; 