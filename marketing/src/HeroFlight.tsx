import React from 'react';
import { AbsoluteFill, interpolate, Easing, useCurrentFrame, useVideoConfig } from 'remotion';
import { FONT_UI, AMBER_GRAD, PLANE_PATH } from './theme';
import { PALETTE_MAP, PaletteContext, mixPalette, Palette } from './palettes';
import { Backdrop, Wordmark, Eyebrow } from './components/Chrome';
import { Board3D } from './components/Board3D';
import { CellSpec } from './components/Grid';
import { SOLUTION, ROUTE, centerOf } from './sudoku';

const FPS = 30;
export const HERO_DURATION = 420; // 14s

// --- timeline anchors (frames) ---
const INTRO_END = 45;
const FLIGHT_END = 215;
const SHOW_START = 215;
const SHOW_END = 345;
const OUTRO_START = 350;

type Pt = { x: number; y: number };
const START: Pt = { x: -0.12, y: 1.1 };
const ROUTE_PTS: Pt[] = ROUTE.map(centerOf);
const PATH: Pt[] = [START, ...ROUTE_PTS];
const N = ROUTE_PTS.length;
const END: Pt = { x: 1.14, y: -0.14 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Active palette as a function of time (crossfades through every theme).
const PAL_KEYS: { f: number; id: string }[] = [
  { f: 0, id: 'flight-deck' },
  { f: SHOW_START, id: 'flight-deck' },
  { f: 240, id: 'sunset' },
  { f: 266, id: 'phosphor' },
  { f: 292, id: 'carbon' },
  { f: 318, id: 'daylight' },
  { f: SHOW_END, id: 'flight-deck' },
  { f: HERO_DURATION, id: 'flight-deck' },
];
function paletteAt(frame: number): Palette {
  let a = PAL_KEYS[0];
  let b = PAL_KEYS[PAL_KEYS.length - 1];
  for (let i = 0; i < PAL_KEYS.length - 1; i++) {
    if (frame >= PAL_KEYS[i].f && frame <= PAL_KEYS[i + 1].f) {
      a = PAL_KEYS[i];
      b = PAL_KEYS[i + 1];
      break;
    }
  }
  const raw = b.f === a.f ? 0 : (frame - a.f) / (b.f - a.f);
  const t = Easing.inOut(Easing.ease)(Math.min(1, Math.max(0, raw)));
  return mixPalette(PALETTE_MAP[a.id], PALETTE_MAP[b.id], t);
}

function buildFlightCells(landedCount: number, freshIdx: number, pop: number): CellSpec[] {
  const landed = new Set(ROUTE.slice(0, landedCount));
  const armTarget = landedCount < N ? ROUTE[landedCount] : -1;
  const ahead = new Set(ROUTE.slice(landedCount + 1));
  return SOLUTION.map((v, i) => {
    if (landed.has(i)) return { v, kind: 'landed', pop: i === freshIdx ? pop : 0 };
    if (i === armTarget) return { v: 0, kind: 'arming' };
    if (ahead.has(i)) return { v: 0, kind: 'empty' };
    return { v, kind: 'given' };
  });
}

export const HeroFlight: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const u = width / 100;
  const P = paletteAt(frame);
  const boardSize = width * 0.78;

  // --- flight position along the path ---
  const flightP = interpolate(frame, [INTRO_END, FLIGHT_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const pathIndex = flightP * (PATH.length - 1);
  const i0 = Math.min(PATH.length - 1, Math.floor(pathIndex));
  const i1 = Math.min(PATH.length - 1, i0 + 1);
  const segFrac = pathIndex - i0;

  let pos: Pt = { x: lerp(PATH[i0].x, PATH[i1].x, segFrac), y: lerp(PATH[i0].y, PATH[i1].y, segFrac) };
  const landedCount = Math.min(N, Math.floor(pathIndex));
  const freshIdx = landedCount > 0 ? ROUTE[landedCount - 1] : -1;
  const pop = interpolate(pathIndex - landedCount, [0, 0.45], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // heading from the current tangent
  const dx = PATH[i1].x - PATH[i0].x;
  const dy = PATH[i1].y - PATH[i0].y;
  let heading = (Math.atan2(dx, -dy) * 180) / Math.PI;

  // After the flight: drift to a gentle hover over the board center for the
  // palette showcase, then climb out top-right in the outro.
  let elevation = boardSize * 0.2;
  let contrail = 1;
  const bob = Math.sin((frame / FPS) * 2.4) * boardSize * 0.015;

  if (frame > FLIGHT_END && frame < OUTRO_START) {
    const k = interpolate(frame, [FLIGHT_END, FLIGHT_END + 40], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.ease),
    });
    pos = { x: lerp(ROUTE_PTS[N - 1].x, 0.5, k), y: lerp(ROUTE_PTS[N - 1].y, 0.46, k) };
    heading = lerp(40, 6, k); // ease nose toward upright as it parks
    elevation = boardSize * (0.2 + 0.06 * k);
    contrail = 0.35;
  } else if (frame >= OUTRO_START) {
    const k = interpolate(frame, [OUTRO_START, HERO_DURATION], [0, 1], {
      extrapolateRight: 'clamp',
      easing: Easing.in(Easing.cubic),
    });
    pos = { x: lerp(0.5, END.x, k), y: lerp(0.46, END.y, k) };
    heading = 42;
    elevation = boardSize * (0.26 + 0.7 * k);
    contrail = 0.35 + 0.9 * k;
  }

  // --- board entrance ---
  const tilt = interpolate(frame, [0, INTRO_END], [74, 52], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const boardScale = interpolate(frame, [0, INTRO_END], [0.82, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const boardOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });

  const cells = buildFlightCells(landedCount, freshIdx, pop);

  // --- text states ---
  const headerOpacity = interpolate(frame, [8, 28], [0, 1], { extrapolateRight: 'clamp' });
  const inShowcase = frame >= SHOW_START + 8 && frame <= SHOW_END;
  const showcaseOpacity = interpolate(
    frame,
    [SHOW_START + 4, SHOW_START + 18, SHOW_END - 10, SHOW_END + 4],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const outroOpacity = interpolate(frame, [OUTRO_START + 6, OUTRO_START + 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <PaletteContext.Provider value={P}>
      <AbsoluteFill>
        <Backdrop>
          {/* top header */}
          <div
            style={{
              position: 'absolute',
              top: u * 9,
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: u * 2,
              opacity: headerOpacity,
            }}
          >
            <Wordmark size={u * 8} />
            <div style={{ opacity: interpolate(frame, [24, 44], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              <Eyebrow size={u * 2.1}>The Sudoku That Flies</Eyebrow>
            </div>
          </div>

          {/* board */}
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ transform: `scale(${boardScale})`, opacity: boardOpacity }}>
              <Board3D
                size={boardSize}
                cells={cells}
                tilt={tilt}
                plane={{
                  x: pos.x,
                  y: pos.y + bob / boardSize,
                  elevation,
                  bank: heading,
                  size: boardSize * 0.2,
                  contrail,
                  glow: 1,
                }}
              />
            </div>
          </AbsoluteFill>

          {/* palette showcase label */}
          {inShowcase && (
            <div
              style={{
                position: 'absolute',
                bottom: u * 12,
                left: 0,
                right: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: u * 1.4,
                opacity: showcaseOpacity,
              }}
            >
              <Eyebrow size={u * 2}>Five Flight-Deck Palettes</Eyebrow>
              <div
                style={{
                  fontFamily: FONT_UI,
                  fontWeight: 700,
                  fontSize: u * 6,
                  color: P.ink,
                  textShadow: `0 0 ${u * 3}px ${P.cyan}66`,
                }}
              >
                {P.name}
              </div>
            </div>
          )}

          {/* outro callout */}
          <div
            style={{
              position: 'absolute',
              bottom: u * 11,
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: u * 3,
              opacity: outroOpacity,
            }}
          >
            <div
              style={{
                fontFamily: FONT_UI,
                fontWeight: 700,
                fontSize: u * 5.4,
                textAlign: 'center',
                lineHeight: 1.1,
                color: P.ink,
              }}
            >
              Prune. Hit{' '}
              <span
                style={{
                  background: `linear-gradient(120deg, ${P.cyan}, ${P.amber})`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                FLY.
              </span>{' '}
              Land it.
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: u * 1.4,
                padding: `${u * 1.6}px ${u * 3.4}px`,
                borderRadius: u * 2.4,
                background: AMBER_GRAD,
                boxShadow: `0 ${u}px ${u * 3}px ${P.amberDeep}66, 0 0 ${u * 5}px ${P.amber}66`,
              }}
            >
              <svg viewBox="0 0 24 24" width={u * 4.4} height={u * 4.4} style={{ color: '#160f02' }}>
                <path fill="currentColor" d={PLANE_PATH} />
              </svg>
              <span style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: u * 3.6, color: '#160f02', letterSpacing: u * 0.1 }}>
                FLY
              </span>
            </div>
          </div>
        </Backdrop>
      </AbsoluteFill>
    </PaletteContext.Provider>
  );
};
