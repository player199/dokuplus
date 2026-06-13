// Flight controller for FLY mode. Given the ordered list of cells the cascade
// will fill, it flies a plane sprite along a smooth Catmull-Rom path through
// their centers — nose tracking the heading, wings banking into the turns — and
// fires onLand the instant the plane passes over each cell so the digit drops
// in time with the flight. Pure DOM (no React re-renders per frame), no deps.

export interface Pt {
  x: number;
  y: number;
}

export interface FlightOptions {
  plane: HTMLElement; // outer element: positioned + heading (rotate Z)
  craft: HTMLElement | null; // inner element: bank (rotateY)
  width: number; // board size in px
  height: number;
  centers: Pt[]; // one point per waypoint, fractions 0..1 of the board
  reducedMotion: boolean;
  onLand: (k: number) => void; // waypoint k reached
  onDone: () => void; // plane has exited
}

const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });
const len = (a: Pt): number => Math.hypot(a.x, a.y) || 1e-6;

// Catmull-Rom position and tangent for the segment p1->p2 at local t in [0,1].
const crPos = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
};

const crTan = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const t2 = t * t;
  return {
    x:
      0.5 *
      (-p0.x + p2.x + 2 * (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t +
        3 * (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t2),
    y:
      0.5 *
      (-p0.y + p2.y + 2 * (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t +
        3 * (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t2),
  };
};

const norm180 = (deg: number): number => {
  let d = deg % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
};

export function animateFlight(o: FlightOptions): () => void {
  const { plane, craft, width, height, centers, onLand, onDone } = o;
  const n = centers.length;

  const place = (p: Pt, headingDeg: number) => {
    plane.style.left = `${p.x * width}px`;
    plane.style.top = `${p.y * height}px`;
    plane.style.transform = `translate(-50%, -50%) rotate(${headingDeg}deg)`;
  };

  // Reduced motion: skip the flight, just drop digits on a quick cadence.
  if (o.reducedMotion) {
    let k = 0;
    plane.style.opacity = '0';
    const id = window.setInterval(() => {
      if (k >= n) {
        window.clearInterval(id);
        onDone();
        return;
      }
      onLand(k);
      k += 1;
    }, 70);
    return () => window.clearInterval(id);
  }

  // Build the control points: an off-board entry, every cell center, an exit.
  // The entry/exit extend the first/last heading so the plane flies in and out.
  const entryDir = n > 1 ? sub(centers[0], centers[1]) : { x: 0, y: -1 };
  const exitDir = n > 1 ? sub(centers[n - 1], centers[n - 2]) : { x: 0, y: -1 };
  const ed = len(entryDir);
  const xd = len(exitDir);
  const entry: Pt = {
    x: centers[0].x + (entryDir.x / ed) * 0.42,
    y: centers[0].y + (entryDir.y / ed) * 0.42,
  };
  const exit: Pt = {
    x: centers[n - 1].x + (exitDir.x / xd) * 0.42,
    y: centers[n - 1].y + (exitDir.y / xd) * 0.42,
  };
  const pts: Pt[] = [entry, ...centers, exit];
  const m = pts.length; // = n + 2

  const at = (i: number) => pts[Math.max(0, Math.min(m - 1, i))];

  let s = 0; // continuous index along pts, 0..(m-1)
  let landed = 0;
  let bank = 0;
  let prevHeading = 0;
  let raf = 0;
  let last = performance.now();
  let started = false;

  const frame = (now: number) => {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.05) dt = 0.05; // clamp after tab stalls

    const seg = Math.floor(s);
    const local = s - seg;
    const p0 = at(seg - 1);
    const p1 = at(seg);
    const p2 = at(seg + 1);
    const p3 = at(seg + 2);

    const pos = crPos(p0, p1, p2, p3, local);
    const tan = crTan(p0, p1, p2, p3, local);
    const heading = (Math.atan2(tan.y, tan.x) * 180) / Math.PI + 90;

    if (!started) {
      prevHeading = heading;
      started = true;
    }

    // Bank into the turn, proportional to how fast the heading is changing.
    const turn = norm180(heading - prevHeading);
    const targetBank = Math.max(-32, Math.min(32, -turn * 9));
    bank += (targetBank - bank) * Math.min(1, dt * 12);
    prevHeading = heading;

    place(pos, heading);
    if (craft) craft.style.transform = `rotateY(${bank.toFixed(2)}deg)`;

    // Land any cells we've crossed (cell k sits at pts index k+1).
    while (landed < n && s >= landed + 1) {
      onLand(landed);
      landed += 1;
    }

    if (s >= m - 1) {
      onDone();
      return;
    }

    // Advance at a roughly constant spatial speed. Momentum builds per cell
    // landed (absolute), not as a fraction of the route, so a short 2-3 cell
    // flight stays calm instead of snapping straight to full speed, while a
    // long cascade still winds up fast over its first several cells.
    const segLen = len(sub(at(seg + 1), at(seg)));
    const speed = Math.min(2, 0.8 + 0.17 * landed); // board-fractions / sec
    s = Math.min(m - 1, s + (speed * dt) / segLen);

    raf = requestAnimationFrame(frame);
  };

  // Position at the entry point before revealing, so there's no corner flash.
  const startPos = crPos(at(-1), at(0), at(1), at(2), 0);
  const startTan = crTan(at(-1), at(0), at(1), at(2), 0);
  place(startPos, (Math.atan2(startTan.y, startTan.x) * 180) / Math.PI + 90);
  plane.style.opacity = '1';

  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
