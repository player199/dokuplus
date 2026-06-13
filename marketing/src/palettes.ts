import { createContext, useContext } from 'react';

// Full color sets for every shipped theme (mirrors src/core/themes.ts). The
// video recolors the scene by swapping the active palette via context; the
// store posters keep the default Flight Deck look.
export interface Palette {
  id: string;
  name: string;
  scheme: 'dark' | 'light';
  bg: string;
  bg2: string;
  panel: string;
  panel2: string;
  hair: string;
  hair2: string;
  gridLine: string;
  gridStrong: string;
  ink: string;
  inkDim: string;
  inkFaint: string;
  cyan: string;
  cyanDeep: string;
  amber: string;
  amberDeep: string;
  red: string;
  good: string;
}

export const PALETTES: Palette[] = [
  {
    id: 'flight-deck', name: 'Flight Deck', scheme: 'dark',
    bg: '#060a12', bg2: '#0a111d', panel: '#0c1422', panel2: '#111d31',
    hair: '#1d2c47', hair2: '#2a3e63', gridLine: '#18283f', gridStrong: '#37527f',
    ink: '#eef4ff', inkDim: '#8497ba', inkFaint: '#50628a',
    cyan: '#35e1ff', cyanDeep: '#2b8fff', amber: '#ffb22e', amberDeep: '#ff8a1f',
    red: '#ff5168', good: '#2ee6a6',
  },
  {
    id: 'sunset', name: 'Sunset Runway', scheme: 'dark',
    bg: '#160d1c', bg2: '#1d1126', panel: '#211430', panel2: '#2b1a40',
    hair: '#3a2350', hair2: '#52356f', gridLine: '#311f47', gridStrong: '#6e4790',
    ink: '#fbeeff', inkDim: '#c2a3d6', inkFaint: '#8a6aa6',
    cyan: '#ff6ba0', cyanDeep: '#d23f7e', amber: '#ffb454', amberDeep: '#ff7a3d',
    red: '#ff5a78', good: '#46e0a0',
  },
  {
    id: 'phosphor', name: 'Radar Phosphor', scheme: 'dark',
    bg: '#04100a', bg2: '#06160e', panel: '#081b12', panel2: '#0c2419',
    hair: '#123524', hair2: '#1c5038', gridLine: '#0f2c1e', gridStrong: '#1f6b48',
    ink: '#dffce9', inkDim: '#7fc7a0', inkFaint: '#4f8a6a',
    cyan: '#36ffa6', cyanDeep: '#11c878', amber: '#ffe45c', amberDeep: '#ffb300',
    red: '#ff6b6b', good: '#36ffa6',
  },
  {
    id: 'carbon', name: 'Carbon', scheme: 'dark',
    bg: '#0a0b0d', bg2: '#0f1114', panel: '#131519', panel2: '#1a1d22',
    hair: '#262a31', hair2: '#3a3f48', gridLine: '#20242a', gridStrong: '#474d57',
    ink: '#eef1f6', inkDim: '#9aa3b0', inkFaint: '#626a76',
    cyan: '#aebccf', cyanDeep: '#7d8ba0', amber: '#e9a23b', amberDeep: '#cf7d1e',
    red: '#ef5466', good: '#4cd3a0',
  },
  {
    id: 'daylight', name: 'Daylight', scheme: 'light',
    bg: '#e7ecf5', bg2: '#dde4f0', panel: '#ffffff', panel2: '#f2f5fb',
    hair: '#cdd7e8', hair2: '#aebbd4', gridLine: '#c5d0e3', gridStrong: '#6f82a6',
    ink: '#0f1c30', inkDim: '#51648a', inkFaint: '#8593b0',
    cyan: '#0f8fc9', cyanDeep: '#0b6f9e', amber: '#e07b0a', amberDeep: '#c25e00',
    red: '#e11d48', good: '#0a9d6e',
  },
];

export const PALETTE_MAP: Record<string, Palette> = Object.fromEntries(
  PALETTES.map((p) => [p.id, p])
);

export const PaletteContext = createContext<Palette>(PALETTES[0]);
export const usePalette = () => useContext(PaletteContext);

// Linear blend two hex colors (for smooth crossfades between palettes).
const hx = (h: string) => {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};
const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
export const mixHex = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = hx(a);
  const [r2, g2, b2] = hx(b);
  return `#${toHex(r1 + (r2 - r1) * t)}${toHex(g1 + (g2 - g1) * t)}${toHex(b1 + (b2 - b1) * t)}`;
};
export const mixPalette = (a: Palette, b: Palette, t: number): Palette => {
  const out = { ...a } as Palette;
  (Object.keys(a) as (keyof Palette)[]).forEach((k) => {
    const av = a[k];
    const bv = b[k];
    if (typeof av === 'string' && av.startsWith('#') && typeof bv === 'string') {
      (out[k] as string) = mixHex(av, bv, t);
    }
  });
  out.scheme = t < 0.5 ? a.scheme : b.scheme;
  out.name = t < 0.5 ? a.name : b.name;
  out.id = t < 0.5 ? a.id : b.id;
  return out;
};
