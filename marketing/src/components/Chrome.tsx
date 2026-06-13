import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_UI, FONT_MONO, PLANE_PATH } from '../theme';
import { usePalette } from '../palettes';

// The app background: deep base with a radial accent wash, a faint flight-grid
// texture and a vignette. Colors follow the active palette.
export const Backdrop: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const P = usePalette();
  return (
    <AbsoluteFill
      style={{ background: `radial-gradient(120% 90% at 50% 8%, ${P.bg2} 0%, ${P.bg} 60%)` }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${P.hair}22 1px, transparent 1px), linear-gradient(90deg, ${P.hair}22 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(120% 80% at 50% 20%, black 0%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(120% 80% at 50% 20%, black 0%, transparent 75%)',
          opacity: 0.5,
        }}
      />
      <AbsoluteFill
        style={{ background: `radial-gradient(60% 36% at 50% 30%, ${P.cyan}14 0%, transparent 70%)` }}
      />
      {children}
      <AbsoluteFill
        style={{
          boxShadow: `inset 0 0 28vw ${P.scheme === 'light' ? 'rgba(40,60,90,0.22)' : 'rgba(0,0,0,0.6)'}`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

export const Wordmark: React.FC<{ size: number }> = ({ size }) => {
  const P = usePalette();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.28 }}>
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        style={{
          color: P.cyan,
          filter: `drop-shadow(0 0 ${size * 0.25}px ${P.cyan}aa)`,
          transform: 'rotate(8deg)',
        }}
      >
        <path fill="currentColor" d={PLANE_PATH} />
      </svg>
      <div
        style={{
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: -size * 0.03,
          color: P.ink,
          lineHeight: 1,
        }}
      >
        doku
        <span
          style={{
            background: `linear-gradient(135deg, ${P.amber}, ${P.amberDeep})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          +
        </span>
      </div>
    </div>
  );
};

export const Eyebrow: React.FC<{ children: React.ReactNode; size: number; color?: string }> = ({
  children,
  size,
  color,
}) => {
  const P = usePalette();
  const c = color ?? P.cyan;
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: size * 0.3,
        textTransform: 'uppercase',
        color: c,
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.6,
      }}
    >
      <span style={{ width: size * 1.6, height: 2, background: c, opacity: 0.6 }} />
      {children}
    </div>
  );
};
