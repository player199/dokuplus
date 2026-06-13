import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { FLIGHT_DECK, FONT_UI, FONT_MONO } from './theme';
import { Backdrop, Wordmark } from './components/Chrome';
import { Board3D } from './components/Board3D';
import { buildHeroCells, HERO_PLANE } from './scene';

// A landscape banner used for the Play "feature graphic" (1024x500) and the
// website OG/Twitter card (1200x630). Text sits left, the tilted board + jet
// sit right. `safe` keeps critical content inside Google's 924x400 safe area.
export const Banner: React.FC<{ tagline?: boolean }> = ({ tagline = true }) => {
  const { width, height } = useVideoConfig();
  const u = width / 100;
  const board = height * 1.05;

  return (
    <AbsoluteFill>
      <Backdrop>
        <AbsoluteFill style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          {/* left: copy */}
          <div
            style={{
              flex: 1,
              paddingLeft: u * 7,
              paddingRight: u * 2,
              display: 'flex',
              flexDirection: 'column',
              gap: u * 2.4,
            }}
          >
            <Wordmark size={u * 6} />
            <h1
              style={{
                margin: 0,
                fontFamily: FONT_UI,
                fontWeight: 700,
                fontSize: u * 6.4,
                lineHeight: 1.05,
                letterSpacing: -u * 0.1,
                color: FLIGHT_DECK.ink,
              }}
            >
              The sudoku{' '}
              <span
                style={{
                  background: `linear-gradient(120deg, ${FLIGHT_DECK.cyan}, ${FLIGHT_DECK.amber})`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                that flies.
              </span>
            </h1>
            {tagline && (
              <p
                style={{
                  margin: 0,
                  fontFamily: FONT_MONO,
                  fontSize: u * 2.4,
                  letterSpacing: u * 0.05,
                  color: FLIGHT_DECK.inkDim,
                  maxWidth: u * 52,
                }}
              >
                Prune your candidates, hit FLY, and watch the board land itself.
              </p>
            )}
          </div>
          {/* right: board */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'visible',
            }}
          >
            <Board3D size={board} cells={buildHeroCells(7)} tilt={52} plane={HERO_PLANE(board)} />
          </div>
        </AbsoluteFill>
      </Backdrop>
    </AbsoluteFill>
  );
};
