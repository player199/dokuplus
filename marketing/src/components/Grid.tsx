import React from 'react';
import { FONT_MONO } from '../theme';
import { usePalette } from '../palettes';
import { colOf, rowOf } from '../sudoku';

export type CellKind = 'given' | 'landed' | 'arming' | 'empty';

export interface CellSpec {
  v: number;
  kind: CellKind;
  notes?: number[];
  pop?: number; // 0..1, freshly-landed pop (scale + extra glow)
}

// A flat 9x9 sudoku grid, rendered at `size` px square. Meant to be wrapped in
// a 3D transform by the caller. Mirrors the app's cell treatment: thin hairlines,
// bold 3x3 box dividers, glowing HUD brackets, given vs. just-landed digits.
export const Grid: React.FC<{ size: number; cells: CellSpec[] }> = ({ size, cells }) => {
  const P = usePalette();
  const cell = size / 9;
  const bracket = size * 0.07;
  const bracketW = Math.max(3, size * 0.006);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(160deg, ${P.panel} 0%, ${P.bg2} 100%)`,
        borderRadius: size * 0.03,
        boxShadow: `inset 0 0 ${size * 0.12}px rgba(0,0,0,0.55)`,
        overflow: 'hidden',
      }}
    >
      {cells.map((c, i) => {
        const col = colOf(i);
        const row = rowOf(i);
        const boxRight = col % 3 === 2 && col !== 8;
        const boxBottom = row % 3 === 2 && row !== 8;
        const landed = c.kind === 'landed';
        const arming = c.kind === 'arming';
        const pop = c.pop ?? 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: col * cell,
              top: row * cell,
              width: cell,
              height: cell,
              borderRight: `${boxRight ? bracketW : 1}px solid ${boxRight ? P.gridStrong : P.gridLine}`,
              borderBottom: `${boxBottom ? bracketW : 1}px solid ${boxBottom ? P.gridStrong : P.gridLine}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: landed
                ? `radial-gradient(circle at 50% 50%, ${P.amber}${pop > 0 ? '3a' : '26'} 0%, transparent 70%)`
                : arming
                ? `${P.cyan}10`
                : 'transparent',
              boxShadow: landed ? `inset 0 0 ${cell * 0.4}px ${P.amber}55` : undefined,
            }}
          >
            {c.v !== 0 ? (
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontWeight: c.kind === 'given' ? 600 : 700,
                  fontSize: cell * 0.62,
                  lineHeight: 1,
                  transform: pop > 0 ? `scale(${1 + 0.35 * pop})` : undefined,
                  color: landed ? P.amber : c.kind === 'given' ? P.ink : P.cyan,
                  textShadow: landed
                    ? `0 0 ${cell * (0.35 + pop * 0.5)}px ${P.amber}`
                    : c.kind === 'given'
                    ? 'none'
                    : `0 0 ${cell * 0.28}px ${P.cyan}88`,
                }}
              >
                {c.v}
              </span>
            ) : c.notes && c.notes.length ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gridTemplateRows: 'repeat(3, 1fr)',
                  padding: cell * 0.08,
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <span
                    key={n}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: FONT_MONO,
                      fontSize: cell * 0.2,
                      color: c.notes?.includes(n) ? P.inkDim : 'transparent',
                    }}
                  >
                    {n}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}

      {(
        [
          { t: true, l: true, bt: true, bl: true },
          { t: true, r: true, bt: true, br: true },
          { b: true, l: true, bb: true, bl: true },
          { b: true, r: true, bb: true, br: true },
        ] as Array<Record<string, boolean>>
      ).map((b, idx) => (
        <span
          key={idx}
          aria-hidden
          style={{
            position: 'absolute',
            width: bracket,
            height: bracket,
            top: b.t ? size * 0.012 : undefined,
            bottom: b.b ? size * 0.012 : undefined,
            left: b.l ? size * 0.012 : undefined,
            right: b.r ? size * 0.012 : undefined,
            borderTop: b.bt ? `${bracketW}px solid ${P.cyan}` : undefined,
            borderBottom: b.bb ? `${bracketW}px solid ${P.cyan}` : undefined,
            borderLeft: b.bl ? `${bracketW}px solid ${P.cyan}` : undefined,
            borderRight: b.br ? `${bracketW}px solid ${P.cyan}` : undefined,
            filter: `drop-shadow(0 0 ${size * 0.012}px ${P.cyan}aa)`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
};
