import React from 'react';

const APP_STORE_URL =
  'https://apps.apple.com/app/id6779887831?action=write-review';

interface Props {
  onDone: () => void;
}

const ReviewPrompt: React.FC<Props> = ({ onDone }) => {
  const handleRate = () => {
    window.open(APP_STORE_URL, '_blank', 'noopener');
    onDone();
  };

  return (
    <div className="overlay" role="dialog" aria-label="Rate doku+">
      <div className="overlay__card">
        <div className="overlay__plane">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5Z"
            />
          </svg>
        </div>
        <h2>Enjoying doku+?</h2>
        <p className="overlay__sub">
          A quick rating helps others find the app — and keeps the runway lights on.
        </p>
        <button type="button" className="btn btn--primary" onClick={handleRate}>
          ★ Rate on the App Store
        </button>
        <button type="button" className="btn btn--ghost" onClick={onDone}>
          Not now
        </button>
      </div>
    </div>
  );
};

export default ReviewPrompt;
