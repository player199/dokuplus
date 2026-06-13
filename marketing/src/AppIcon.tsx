import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { FLIGHT_DECK, FONT_UI, PLANE_PATH } from './theme';

// The store app icon. iOS wants a 1024x1024 square with NO transparency and NO
// rounded corners (Apple masks it). Play wants 512x512. Same artwork, two sizes.
export const AppIcon: React.FC = () => {
  // Everything is sized relative to the actual canvas, so the 512 and 1024
  // icons are identical layouts (not a 1024 layout clipped onto a 512 canvas).
  const S = useVideoConfig().width;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 120% at 30% 20%, ${FLIGHT_DECK.panel2} 0%, ${FLIGHT_DECK.bg} 62%)`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* faint flight grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${FLIGHT_DECK.hair}40 2px, transparent 2px), linear-gradient(90deg, ${FLIGHT_DECK.hair}40 2px, transparent 2px)`,
          backgroundSize: `${S * 0.11}px ${S * 0.11}px`,
          maskImage: 'radial-gradient(70% 70% at 50% 50%, black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(70% 70% at 50% 50%, black 0%, transparent 80%)',
          opacity: 0.6,
        }}
      />
      {/* cyan glow behind the jet */}
      <div
        style={{
          position: 'absolute',
          width: S * 0.7,
          height: S * 0.7,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${FLIGHT_DECK.cyan}33 0%, transparent 65%)`,
        }}
      />
      <svg
        viewBox="0 0 24 24"
        width={S * 0.52}
        height={S * 0.52}
        style={{
          color: FLIGHT_DECK.cyan,
          transform: 'rotate(8deg)',
          filter: `drop-shadow(0 ${S * 0.01}px ${S * 0.03}px rgba(0,0,0,0.5)) drop-shadow(0 0 ${
            S * 0.05
          }px ${FLIGHT_DECK.cyan}aa)`,
        }}
      >
        <path fill="currentColor" d={PLANE_PATH} />
      </svg>
      {/* amber plus, echoing the wordmark */}
      <div
        style={{
          position: 'absolute',
          right: S * 0.2,
          top: S * 0.2,
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: S * 0.2,
          background: `linear-gradient(135deg, ${FLIGHT_DECK.amber}, ${FLIGHT_DECK.amberDeep})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          filter: `drop-shadow(0 0 ${S * 0.03}px ${FLIGHT_DECK.amber}66)`,
        }}
      >
        +
      </div>
    </AbsoluteFill>
  );
};
