import React from 'react';
import { PLANE_PATH } from '../theme';
import { usePalette } from '../palettes';

// The paper-jet. The raw icon points NORTH; callers rotate the whole craft to
// aim it along its heading, so the contrail streams DOWN in local space.
//
// IMPORTANT: this lives inside a `preserve-3d` board. Chromium rasterizes any
// CSS filter/blur on a 3D-transformed element into a layer clipped to that
// element's box — a soft glow then gets a hard SQUARE edge. To avoid it we:
//   1. give the craft a big transparent containing box (BOX) so the glow and
//      contrail fade to full transparency well inside the box edges, and
//   2. build the glow from radial/linear gradients (which self-terminate),
//      not from `drop-shadow`, whose output box is what gets clipped.
const hexA = (hex: string, a: number) =>
  `${hex}${Math.round(Math.min(1, Math.max(0, a)) * 255)
    .toString(16)
    .padStart(2, '0')}`;

export const Plane: React.FC<{
  size: number;
  contrail?: number; // 0..1 length of the trail
  glow?: number; // 0..1 strength of the amber bloom
}> = ({ size, contrail = 0, glow = 1 }) => {
  const P = usePalette();
  const BOX = size * 7; // big transparent frame; icon sits at its center
  const c = BOX / 2;
  return (
    <div style={{ position: 'relative', width: BOX, height: BOX, pointerEvents: 'none' }}>
      {/* circular radial halo — gradient reaches full transparency long before
          the box edge, so there is no rectangle to clip */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: c,
          top: c,
          width: size * 3,
          height: size * 3,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle closest-side, ${hexA(P.amber, 0.55 * glow)} 0%, ${hexA(
            P.amber,
            0.16 * glow
          )} 38%, transparent 70%)`,
        }}
      />
      {contrail > 0 && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: c,
            top: c,
            width: size * 0.9,
            height: size * 3 * contrail,
            transform: 'translateX(-50%)',
            transformOrigin: 'top center',
            // tapered triangle so there are no straight corners in the blur
            clipPath: 'polygon(40% 0%, 60% 0%, 50% 100%)',
            background: `linear-gradient(180deg, ${hexA(P.amber, 0.8)} 0%, ${hexA(
              P.cyan,
              0.27
            )} 42%, transparent 100%)`,
            filter: `blur(${size * 0.05}px)`,
          }}
        />
      )}
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        style={{
          position: 'absolute',
          left: c,
          top: c,
          transform: 'translate(-50%, -50%)',
          display: 'block',
          color: P.amber,
        }}
      >
        <path fill="currentColor" d={PLANE_PATH} />
      </svg>
    </div>
  );
};
