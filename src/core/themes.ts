// Theme registry. Each theme is a compact set of seed colors; the resolver
// derives the full CSS-variable palette (soft tints, gradients, shadow, cell
// colors) so adding a new color pack only means choosing ~16 colors.
//
// Free themes ship to everyone. "pack" themes are cosmetic purchases — gating is
// handled by entitlements.ts, which is where the store (RevenueCat) plugs in.

export type ThemeGroup = 'free' | 'pack';

export interface ThemeSpec {
  id: string;
  name: string;
  group: ThemeGroup;
  colorScheme: 'dark' | 'light';
  // seed palette
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
  cyan: string; // primary / interactive accent
  cyanDeep: string;
  amber: string; // action / FLY accent
  amberDeep: string;
  red: string;
  good: string;
}

export const THEMES: ThemeSpec[] = [
  {
    id: 'flight-deck',
    name: 'Flight Deck',
    group: 'free',
    colorScheme: 'dark',
    bg: '#060a12', bg2: '#0a111d', panel: '#0c1422', panel2: '#111d31',
    hair: '#1d2c47', hair2: '#2a3e63', gridLine: '#18283f', gridStrong: '#37527f',
    ink: '#eef4ff', inkDim: '#8497ba', inkFaint: '#50628a',
    cyan: '#35e1ff', cyanDeep: '#2b8fff', amber: '#ffb22e', amberDeep: '#ff8a1f',
    red: '#ff5168', good: '#2ee6a6',
  },
  {
    id: 'daylight',
    name: 'Daylight',
    group: 'free',
    colorScheme: 'light',
    bg: '#e7ecf5', bg2: '#dde4f0', panel: '#ffffff', panel2: '#f2f5fb',
    hair: '#cdd7e8', hair2: '#aebbd4', gridLine: '#c5d0e3', gridStrong: '#6f82a6',
    ink: '#0f1c30', inkDim: '#51648a', inkFaint: '#8593b0',
    cyan: '#0f8fc9', cyanDeep: '#0b6f9e', amber: '#e07b0a', amberDeep: '#c25e00',
    red: '#e11d48', good: '#0a9d6e',
  },
  {
    id: 'sunset',
    name: 'Sunset Runway',
    group: 'pack',
    colorScheme: 'dark',
    bg: '#160d1c', bg2: '#1d1126', panel: '#211430', panel2: '#2b1a40',
    hair: '#3a2350', hair2: '#52356f', gridLine: '#311f47', gridStrong: '#6e4790',
    ink: '#fbeeff', inkDim: '#c2a3d6', inkFaint: '#8a6aa6',
    cyan: '#ff6ba0', cyanDeep: '#d23f7e', amber: '#ffb454', amberDeep: '#ff7a3d',
    red: '#ff5a78', good: '#46e0a0',
  },
  {
    id: 'phosphor',
    name: 'Radar Phosphor',
    group: 'pack',
    colorScheme: 'dark',
    bg: '#04100a', bg2: '#06160e', panel: '#081b12', panel2: '#0c2419',
    hair: '#123524', hair2: '#1c5038', gridLine: '#0f2c1e', gridStrong: '#1f6b48',
    ink: '#dffce9', inkDim: '#7fc7a0', inkFaint: '#4f8a6a',
    cyan: '#36ffa6', cyanDeep: '#11c878', amber: '#ffe45c', amberDeep: '#ffb300',
    red: '#ff6b6b', good: '#36ffa6',
  },
  {
    id: 'carbon',
    name: 'Carbon',
    group: 'pack',
    colorScheme: 'dark',
    bg: '#0a0b0d', bg2: '#0f1114', panel: '#131519', panel2: '#1a1d22',
    hair: '#262a31', hair2: '#3a3f48', gridLine: '#20242a', gridStrong: '#474d57',
    ink: '#eef1f6', inkDim: '#9aa3b0', inkFaint: '#626a76',
    cyan: '#aebccf', cyanDeep: '#7d8ba0', amber: '#e9a23b', amberDeep: '#cf7d1e',
    red: '#ef5466', good: '#4cd3a0',
  },
];

export const THEME_MAP: Record<string, ThemeSpec> = Object.fromEntries(
  THEMES.map((t) => [t.id, t])
);

export const DEFAULT_THEME_ID = 'flight-deck';

export const getTheme = (id: string): ThemeSpec => THEME_MAP[id] ?? THEME_MAP[DEFAULT_THEME_ID];

const hexToRgba = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Applies a theme by writing the derived CSS variables onto the document root.
// Inline vars override the stylesheet defaults, so packs need no extra CSS.
export const applyTheme = (theme: ThemeSpec): void => {
  const root = document.documentElement;
  const s = root.style;
  const set = (k: string, v: string) => s.setProperty(k, v);

  root.dataset.theme = theme.colorScheme; // drives bg texture + overlay tints
  root.style.colorScheme = theme.colorScheme;

  set('--bg', theme.bg);
  set('--bg-2', theme.bg2);
  set('--panel', theme.panel);
  set('--panel-2', theme.panel2);
  set('--hair', theme.hair);
  set('--hair-2', theme.hair2);
  set('--grid-line', theme.gridLine);
  set('--grid-strong', theme.gridStrong);
  set('--ink', theme.ink);
  set('--ink-dim', theme.inkDim);
  set('--ink-faint', theme.inkFaint);
  set('--cyan', theme.cyan);
  set('--cyan-deep', theme.cyanDeep);
  set('--amber', theme.amber);
  set('--amber-deep', theme.amberDeep);
  set('--red', theme.red);
  set('--good', theme.good);

  // Derived tokens.
  set('--cyan-soft', hexToRgba(theme.cyan, 0.14));
  set('--cyan-softer', hexToRgba(theme.cyan, 0.06));
  set('--amber-soft', hexToRgba(theme.amber, 0.16));
  set('--red-soft', hexToRgba(theme.red, 0.15));
  set('--cyan-grad', `linear-gradient(135deg, ${theme.cyan} 0%, ${theme.cyanDeep} 100%)`);
  set('--amber-grad', `linear-gradient(135deg, ${theme.amber} 0%, ${theme.amberDeep} 100%)`);
  set(
    '--shadow',
    theme.colorScheme === 'dark'
      ? '0 14px 30px rgba(0, 0, 0, 0.5)'
      : '0 12px 26px rgba(22, 35, 63, 0.14)'
  );
  set('--cell-given', theme.ink);
  set('--cell-user', theme.cyan);
};
