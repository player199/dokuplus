import React, { useReducer, useState } from 'react';
import { Settings } from '../core/storage';
import { THEMES, ThemeSpec } from '../core/themes';
import { isThemeUnlocked, purchaseTheme } from '../core/entitlements';

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

const ThemeCard: React.FC<{
  theme: ThemeSpec;
  active: boolean;
  unlocked: boolean;
  busy: boolean;
  onSelect: () => void;
}> = ({ theme, active, unlocked, busy, onSelect }) => (
  <button
    type="button"
    className={'theme-card' + (active ? ' is-active' : '')}
    onClick={onSelect}
    disabled={busy}
    aria-pressed={active}
  >
    <span className="theme-card__swatch" style={{ background: theme.bg }}>
      <span className="theme-card__dot" style={{ background: theme.cyan }} />
      <span className="theme-card__dot" style={{ background: theme.amber }} />
      <span className="theme-card__dot" style={{ background: theme.ink }} />
      {!unlocked && (
        <span className="theme-card__lock" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 0 1 6 0v3H9Z"
            />
          </svg>
        </span>
      )}
    </span>
    <span className="theme-card__name">{theme.name}</span>
    <span className="theme-card__tag">
      {theme.group === 'free' ? 'Free' : unlocked ? 'Owned' : busy ? '…' : 'Unlock'}
    </span>
  </button>
);

const SettingsSheet: React.FC<SettingsSheetProps> = ({ settings, onChange, onClose }) => {
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    onChange({ ...settings, [key]: value });

  const [, bump] = useReducer((x) => x + 1, 0); // re-render after an unlock
  const [busyId, setBusyId] = useState<string | null>(null);

  const pickTheme = async (theme: ThemeSpec) => {
    if (isThemeUnlocked(theme.id, theme.group)) {
      set('themeId', theme.id);
      return;
    }
    setBusyId(theme.id);
    const ok = await purchaseTheme(theme.id);
    setBusyId(null);
    if (ok) {
      bump();
      set('themeId', theme.id);
    }
  };

  return (
    <div className="settings-screen" role="dialog" aria-label="Settings">
      <header className="settings-header">
        <h2>Settings</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Done">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M18.3 5.71 12 12l6.3 6.29-1.42 1.42L10.59 13.4 4.3 19.7l-1.42-1.41L9.17 12 2.88 5.71 4.3 4.29l6.29 6.3 6.29-6.3 1.42 1.42Z"
            />
          </svg>
        </button>
      </header>

      <div className="settings-body">
        <section className="settings-group">
          <h3 className="settings-group__title">Appearance</h3>
          <div className="settings-card">
            <div className="setting setting--block">
              <span className="setting__label">Theme</span>
              <span className="setting__desc">Color packs for the flight deck</span>
              <div className="theme-grid">
                {THEMES.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    active={settings.themeId === theme.id}
                    unlocked={isThemeUnlocked(theme.id, theme.group)}
                    busy={busyId === theme.id}
                    onSelect={() => pickTheme(theme)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="settings-group">
          <h3 className="settings-group__title">Gameplay</h3>
          <div className="settings-card">
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
              label="Scenic flight path"
              description="Plane flies a smooth tour instead of solve order"
              checked={settings.scenicFlight}
              onToggle={() => set('scenicFlight', !settings.scenicFlight)}
            />
          </div>
        </section>

        <section className="settings-group">
          <h3 className="settings-group__title">Feedback</h3>
          <div className="settings-card">
            <Toggle
              label="Haptics"
              description="Vibrate gently on input (supported phones)"
              checked={settings.hapticFeedback}
              onToggle={() => set('hapticFeedback', !settings.hapticFeedback)}
            />
          </div>
        </section>

        <button type="button" className="btn btn--primary settings-done" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
};

export default SettingsSheet;
