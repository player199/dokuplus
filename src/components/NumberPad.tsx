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
          FLY
        </button>
      </div>
    </div>
  );
};

export default NumberPad; 