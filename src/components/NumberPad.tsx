import React from 'react';
import './NumberPad.css';

interface NumberPadProps {
  onNumberClick: (num: number) => void;
  onClearClick: () => void;
  candidateMode: boolean;
  inputMode: 'normal' | 'candidate';
  onToggleCandidateMode: () => void;
  setInputMode: (mode: 'normal' | 'candidate') => void;
}

const NumberPad: React.FC<NumberPadProps> = ({
  onNumberClick,
  onClearClick,
  candidateMode,
  inputMode,
  onToggleCandidateMode,
  setInputMode,
}) => {
  return (
    <div className="number-pad">
      <div className="input-mode-buttons">
        <button
          className={`mode-button normal-button ${inputMode === 'normal' ? 'active' : ''}`}
          onClick={() => setInputMode('normal')}
        >
          Normal
        </button>
        <button
          className={`mode-button candidate-button ${inputMode === 'candidate' ? 'active' : ''}`}
          onClick={() => setInputMode('candidate')}
        >
          Candidate
        </button>
      </div>
      <div className="number-buttons">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            className="number-button"
            onClick={() => onNumberClick(num)}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="control-buttons">
        <button
          className={`auto-candidate-button ${candidateMode ? 'active' : ''}`}
          onClick={onToggleCandidateMode}
        >
          Auto Candidates
        </button>
        <button className="clear-button" onClick={onClearClick}>
          Clear
        </button>
      </div>
    </div>
  );
};

export default NumberPad; 