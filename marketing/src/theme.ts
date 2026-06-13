// The doku+ "Flight Deck" design tokens, ported verbatim from the app so the
// store art matches the product pixel-for-pixel. Source: src/core/themes.ts.
import { loadFont as loadSpaceGrotesk } from '@remotion/google-fonts/SpaceGrotesk';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';

// Limit to the weights/subset we actually use — fewer network requests, faster
// and more reliable renders.
const space = loadSpaceGrotesk('normal', {
  weights: ['500', '600', '700'],
  subsets: ['latin'],
  ignoreTooManyRequestsWarning: true,
});
const mono = loadJetBrainsMono('normal', {
  weights: ['500', '600', '700'],
  subsets: ['latin'],
  ignoreTooManyRequestsWarning: true,
});

export const FONT_UI = space.fontFamily;
export const FONT_MONO = mono.fontFamily;

export const FLIGHT_DECK = {
  bg: '#060a12',
  bg2: '#0a111d',
  panel: '#0c1422',
  panel2: '#111d31',
  hair: '#1d2c47',
  hair2: '#2a3e63',
  gridLine: '#18283f',
  gridStrong: '#37527f',
  ink: '#eef4ff',
  inkDim: '#8497ba',
  inkFaint: '#50628a',
  cyan: '#35e1ff',
  cyanDeep: '#2b8fff',
  amber: '#ffb22e',
  amberDeep: '#ff8a1f',
  red: '#ff5168',
  good: '#2ee6a6',
} as const;

export const CYAN_GRAD = `linear-gradient(135deg, ${FLIGHT_DECK.cyan} 0%, ${FLIGHT_DECK.cyanDeep} 100%)`;
export const AMBER_GRAD = `linear-gradient(135deg, #ffc44d 0%, ${FLIGHT_DECK.amberDeep} 100%)`;

// The signature paper-jet path used for the brand logo and the FLY button.
export const PLANE_PATH =
  'M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5Z';

// A handful of the cosmetic theme accents, for the "themes" poster swatches.
export const THEME_SWATCHES = [
  { name: 'Flight Deck', bg: '#060a12', a: '#35e1ff', b: '#ffb22e' },
  { name: 'Sunset Runway', bg: '#160d1c', a: '#ff6ba0', b: '#ffb454' },
  { name: 'Radar Phosphor', bg: '#04100a', a: '#36ffa6', b: '#ffe45c' },
  { name: 'Carbon', bg: '#0a0b0d', a: '#aebccf', b: '#e9a23b' },
  { name: 'Daylight', bg: '#e7ecf5', a: '#0f8fc9', b: '#e07b0a' },
] as const;
