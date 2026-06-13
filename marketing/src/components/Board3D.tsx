import React from 'react';
import { usePalette } from '../palettes';
import { CellSpec, Grid } from './Grid';
import { Plane } from './Plane';

// A sudoku board laid into 3D space and tilted back like a flight-deck table,
// with the jet hovering ABOVE the board surface. The elevation is real 3D:
// the plane is a child of the tilted board plane but pushed toward the camera
// with translateZ, and counter-rotated so it faces the viewer (a billboard).
// Its shadow stays flat on the board at the same cell, so as the plane climbs,
// shadow and craft separate — selling the height.
export const Board3D: React.FC<{
  size: number;
  cells: CellSpec[];
  tilt?: number; // degrees of backward tilt
  plane?: {
    x: number; // 0..1 across the board
    y: number; // 0..1 down the board
    elevation: number; // px above the board surface (in board space)
    bank: number; // heading degrees, 0 = nose up, + = clockwise
    size: number; // px
    contrail?: number;
    glow?: number;
  } | null;
}> = ({ size, cells, tilt = 56, plane = null }) => {
  const P = usePalette();
  return (
    <div style={{ perspective: size * 2.2, perspectiveOrigin: '50% 38%' }}>
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt}deg)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: -size * 0.06,
            borderRadius: size * 0.06,
            background: `radial-gradient(ellipse at 50% 50%, ${P.cyan}1f 0%, transparent 65%)`,
            filter: `blur(${size * 0.03}px)`,
          }}
        />

        <Grid size={size} cells={cells} />

        {plane && (
          <>
            <div
              aria-hidden
              style={{
                position: 'absolute',
                left: plane.x * size,
                top: plane.y * size,
                width: plane.size * 0.9,
                height: plane.size * 0.5,
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0,0,0,0.55)',
                borderRadius: '50%',
                filter: `blur(${plane.size * 0.16}px)`,
                opacity: 0.55,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: plane.x * size,
                top: plane.y * size,
                transformStyle: 'preserve-3d',
                transform: `translate(-50%, -50%) translateZ(${plane.elevation}px) rotateX(${-tilt}deg) rotate(${plane.bank}deg)`,
              }}
            >
              <Plane size={plane.size} contrail={plane.contrail} glow={plane.glow} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
