import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { FLIGHT_DECK, FONT_UI, FONT_MONO, AMBER_GRAD, THEME_SWATCHES, PLANE_PATH } from './theme';
import { Backdrop, Wordmark, Eyebrow } from './components/Chrome';
import { Board3D } from './components/Board3D';
import { CellSpec } from './components/Grid';
import { SOLUTION, ROUTE, NOTE_CELLS, centerOf } from './sudoku';

export type Variant = 'hero' | 'fly' | 'daily' | 'themes' | 'clean';

function buildCells(opts: {
  landed?: Set<number>;
  empty?: Set<number>;
  arming?: Set<number>;
  notes?: Record<number, number[]>;
}): CellSpec[] {
  const { landed, empty, arming, notes } = opts;
  return SOLUTION.map((v, i) => {
    if (landed?.has(i)) return { v, kind: 'landed' };
    if (arming?.has(i)) return { v: 0, kind: 'arming' };
    if (empty?.has(i)) return { v: 0, kind: 'empty', notes: notes?.[i] };
    return { v, kind: 'given' };
  });
}

const FlyChip: React.FC<{ u: number; label?: string; caption?: string }> = ({
  u,
  label = 'FLY',
  caption = 'cleared for takeoff',
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: u * 1.4,
      padding: `${u * 1.5}px ${u * 3}px`,
      borderRadius: u * 2.2,
      background: AMBER_GRAD,
      boxShadow: `0 ${u}px ${u * 3}px ${FLIGHT_DECK.amberDeep}66, 0 0 ${u * 4}px ${FLIGHT_DECK.amber}55`,
    }}
  >
    <svg viewBox="0 0 24 24" width={u * 4} height={u * 4} style={{ color: '#1a1205' }}>
      <path fill="currentColor" d={PLANE_PATH} />
    </svg>
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
      <strong style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: u * 3.4, color: '#160f02' }}>
        {label}
      </strong>
      <small style={{ fontFamily: FONT_MONO, fontSize: u * 1.5, color: '#3a2a06' }}>{caption}</small>
    </div>
  </div>
);

const Headline: React.FC<{ u: number; lines: { t: string; accent?: boolean }[] }> = ({
  u,
  lines,
}) => (
  <h1
    style={{
      margin: 0,
      fontFamily: FONT_UI,
      fontWeight: 700,
      fontSize: u * 7,
      lineHeight: 1.04,
      letterSpacing: -u * 0.12,
      color: FLIGHT_DECK.ink,
    }}
  >
    {lines.map((l, i) => (
      <div key={i}>
        {l.accent ? (
          <span
            style={{
              background: `linear-gradient(120deg, ${FLIGHT_DECK.cyan}, ${FLIGHT_DECK.amber})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {l.t}
          </span>
        ) : (
          l.t
        )}
      </div>
    ))}
  </h1>
);

const StatCard: React.FC<{ u: number; value: string; label: string; accent?: string }> = ({
  u,
  value,
  label,
  accent = FLIGHT_DECK.cyan,
}) => (
  <div
    style={{
      flex: 1,
      padding: u * 2.2,
      borderRadius: u * 2,
      background: FLIGHT_DECK.panel,
      border: `1px solid ${FLIGHT_DECK.hair}`,
      display: 'flex',
      flexDirection: 'column',
      gap: u * 0.6,
    }}
  >
    <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: u * 5, color: accent }}>
      {value}
    </span>
    <span
      style={{
        fontFamily: FONT_MONO,
        fontSize: u * 1.7,
        letterSpacing: u * 0.1,
        textTransform: 'uppercase',
        color: FLIGHT_DECK.inkDim,
      }}
    >
      {label}
    </span>
  </div>
);

export const Poster: React.FC<{ variant: Variant }> = ({ variant }) => {
  const { width, height } = useVideoConfig();
  const u = width / 100; // layout unit = 1% of width
  const pad = u * 8;
  const boardSize = width * 0.82;

  // Shared flight pose: first 7 cells landed, jet banking over the 8th.
  const landedCount = 7;
  const landed = new Set(ROUTE.slice(0, landedCount));
  const ahead = new Set(ROUTE.slice(landedCount + 1));
  const armTarget = ROUTE[landedCount];
  const planeAt = centerOf(armTarget);

  const heroCells = buildCells({ landed, empty: ahead, arming: new Set([armTarget]) });
  const cleanCells = buildCells({
    empty: new Set([...ROUTE.slice(4), 20, 29, 38, 60]),
    landed: new Set(ROUTE.slice(0, 4)),
    notes: NOTE_CELLS,
  });

  const planePose = {
    x: planeAt.x,
    y: planeAt.y,
    elevation: boardSize * 0.2,
    bank: 40,
    size: boardSize * 0.2,
    contrail: 1,
    glow: 1,
  };

  const Header = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Wordmark size={u * 6} />
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: u * 1.8,
          letterSpacing: u * 0.2,
          color: FLIGHT_DECK.inkFaint,
        }}
      >
        SUDOKU · REIMAGINED
      </span>
    </div>
  );

  return (
    <AbsoluteFill>
      <Backdrop>
        <AbsoluteFill
          style={{
            padding: pad,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {Header}

          {variant === 'hero' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: u * 2.4 }}>
                <Eyebrow size={u * 2}>The Sudoku That Flies</Eyebrow>
                <Headline
                  u={u}
                  lines={[{ t: 'Prune your' }, { t: 'candidates.' }, { t: 'FLY lands', accent: true }, { t: 'the rest.', accent: true }]}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: u * 2 }}>
                <Board3D size={boardSize} cells={heroCells} tilt={54} plane={planePose} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <FlyChip u={u} />
              </div>
            </>
          )}

          {variant === 'fly' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: u * 2.4 }}>
                <Eyebrow size={u * 2} color={FLIGHT_DECK.amber}>
                  Flight Mode
                </Eyebrow>
                <Headline u={u} lines={[{ t: 'Pencil it in.' }, { t: 'Clear the deck.' }, { t: 'Watch it', accent: true }, { t: 'land itself.', accent: true }]} />
                <p
                  style={{
                    margin: 0,
                    fontFamily: FONT_UI,
                    fontSize: u * 2.6,
                    lineHeight: 1.4,
                    color: FLIGHT_DECK.inkDim,
                    maxWidth: u * 80,
                  }}
                >
                  Every board needs a real deduction before FLY can finish it. No
                  guesswork, no two flights the same.
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Board3D
                  size={boardSize}
                  cells={heroCells}
                  tilt={48}
                  plane={{ ...planePose, bank: 46, elevation: boardSize * 0.26 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <FlyChip u={u} label="FLY" caption="cleared for takeoff" />
              </div>
            </>
          )}

          {variant === 'daily' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: u * 2 }}>
                <Eyebrow size={u * 2}>Flight Log</Eyebrow>
                <Headline u={u} lines={[{ t: 'A new board' }, { t: 'every day.' }, { t: 'Keep the', accent: true }, { t: 'streak alive.', accent: true }]} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Board3D size={boardSize * 0.92} cells={heroCells} tilt={58} plane={{ ...planePose, elevation: boardSize * 0.16 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: u * 2 }}>
                <div style={{ display: 'flex', gap: u * 2 }}>
                  <StatCard u={u} value="38" label="Day streak" accent={FLIGHT_DECK.amber} />
                  <StatCard u={u} value="91%" label="Win rate" />
                  <StatCard u={u} value="3:42" label="Best time" />
                </div>
              </div>
            </>
          )}

          {variant === 'themes' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: u * 2 }}>
                <Eyebrow size={u * 2}>Cabin Colors</Eyebrow>
                <Headline u={u} lines={[{ t: 'Five flight-deck' }, { t: 'palettes to', accent: false }, { t: 'fly in.', accent: true }]} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Board3D size={boardSize * 0.9} cells={heroCells} tilt={56} plane={planePose} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: u * 1.6 }}>
                {THEME_SWATCHES.map((t) => (
                  <div
                    key={t.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: u * 2,
                      padding: u * 1.6,
                      borderRadius: u * 1.6,
                      background: FLIGHT_DECK.panel,
                      border: `1px solid ${FLIGHT_DECK.hair}`,
                    }}
                  >
                    <div
                      style={{
                        width: u * 7,
                        height: u * 7,
                        borderRadius: u * 1.2,
                        background: t.bg,
                        border: `1px solid ${FLIGHT_DECK.hair2}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: u * 0.8,
                      }}
                    >
                      <span style={{ width: u * 1.6, height: u * 1.6, borderRadius: '50%', background: t.a }} />
                      <span style={{ width: u * 1.6, height: u * 1.6, borderRadius: '50%', background: t.b }} />
                    </div>
                    <span style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: u * 2.6, color: FLIGHT_DECK.ink }}>
                      {t.name}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {variant === 'clean' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: u * 1.6 }}>
                <Eyebrow size={u * 2}>On Approach</Eyebrow>
                <Headline u={u} lines={[{ t: 'Calm, sharp,' }, { t: 'made to', accent: false }, { t: 'think in.', accent: true }]} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: u * 2 }}>
                <Board3D size={boardSize} cells={cleanCells} tilt={50} plane={null} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: u * 2 }}>
                <StatCard u={u} value="4" label="Difficulties" />
                <StatCard u={u} value="Daily" label="Challenge" accent={FLIGHT_DECK.amber} />
                <StatCard u={u} value="Offline" label="Always" accent={FLIGHT_DECK.good} />
              </div>
            </>
          )}
        </AbsoluteFill>
      </Backdrop>
    </AbsoluteFill>
  );
};
