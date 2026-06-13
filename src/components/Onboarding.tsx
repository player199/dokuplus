import React from 'react';
import { markOnboardingSeen } from '../core/meta';

interface Props {
  onDone: () => void;
}

const STEPS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h8v8H3V3Zm0 10h8v8H3v-8Zm10-10h8v8h-8V3Zm0 10h8v8h-8v-8Z" opacity="0.3"/>
        <rect x="6" y="6" width="2" height="2" rx="0.5"/>
        <rect x="16" y="6" width="2" height="2" rx="0.5"/>
        <rect x="6" y="16" width="2" height="2" rx="0.5"/>
        <rect x="14" y="14" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <text x="17" y="19.5" fontSize="5" textAnchor="middle" fill="currentColor" fontWeight="700">?</text>
      </svg>
    ),
    title: 'Mark your candidates',
    body: 'Tap a cell and add pencil marks — the digits that could go there. Narrow it down.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5Z"/>
      </svg>
    ),
    title: 'Hit FLY',
    body: 'When cells have only one possible digit, the FLY button lights up. Tap it.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z"/>
      </svg>
    ),
    title: 'Watch it land',
    body: 'The jet sweeps the board, dropping digits as it goes. Keep flying until it\'s solved.',
  },
];

const Onboarding: React.FC<Props> = ({ onDone }) => {
  const handleDone = () => {
    markOnboardingSeen();
    onDone();
  };

  return (
    <div className="overlay onboarding" role="dialog" aria-label="How to play">
      <div className="overlay__card onboarding__card">
        <div className="onboarding__header">
          <svg className="onboarding__brand-plane" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5Z"/>
          </svg>
          <h2>How to play doku+</h2>
        </div>

        <div className="onboarding__steps">
          {STEPS.map((step, i) => (
            <div className="onboarding__step" key={i}>
              <div className="onboarding__step-icon">{step.icon}</div>
              <div className="onboarding__step-body">
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="btn btn--primary" onClick={handleDone}>
          Let's fly
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
