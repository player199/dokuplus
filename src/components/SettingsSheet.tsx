import React from 'react';
import { Settings } from '../core/storage';

interface SettingsSheetProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onClose: () => void;
}

const Toggle: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}> = ({ label, description, checked, onToggle }) => (
  <button type="button" className="setting" onClick={onToggle} role="switch" aria-checked={checked}>
    <div className="setting__text">
      <span className="setting__label">{label}</span>
      <span className="setting__desc">{description}</span>
    </div>
    <span className={'switch' + (checked ? ' switch--on' : '')}>
      <span className="switch__thumb" />
    </span>
  </button>
);

const SettingsSheet: React.FC<SettingsSheetProps> = ({ settings, onChange, onClose }) => {
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Settings">
        <div className="sheet__handle" />
        <h2>Settings</h2>

        <div className="setting">
          <div className="setting__text">
            <span className="setting__label">Theme</span>
            <span className="setting__desc">Cockpit dark or daylight</span>
          </div>
          <div className="segmented">
            <button
              type="button"
              className={settings.theme === 'dark' ? 'is-active' : ''}
              onClick={() => set('theme', 'dark')}
            >
              Dark
            </button>
            <button
              type="button"
              className={settings.theme === 'light' ? 'is-active' : ''}
              onClick={() => set('theme', 'light')}
            >
              Light
            </button>
          </div>
        </div>

        <Toggle
          label="Mistake limit"
          description="Game ends after 3 wrong entries"
          checked={settings.mistakeLimit}
          onToggle={() => set('mistakeLimit', !settings.mistakeLimit)}
        />
        <Toggle
          label="Show errors"
          description="Mark wrong digits in red"
          checked={settings.showErrors}
          onToggle={() => set('showErrors', !settings.showErrors)}
        />
        <Toggle
          label="Highlight matches"
          description="Light up cells with the same digit"
          checked={settings.highlightSame}
          onToggle={() => set('highlightSame', !settings.highlightSame)}
        />
        <Toggle
          label="Smart notes"
          description="Placing a digit clears it from nearby notes"
          checked={settings.autoCleanNotes}
          onToggle={() => set('autoCleanNotes', !settings.autoCleanNotes)}
        />
        <Toggle
          label="Haptics"
          description="Vibrate gently on input (supported phones)"
          checked={settings.hapticFeedback}
          onToggle={() => set('hapticFeedback', !settings.hapticFeedback)}
        />

        <button type="button" className="btn btn--primary sheet__close" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
};

export default SettingsSheet;
