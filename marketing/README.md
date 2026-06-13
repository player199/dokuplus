# doku+ marketing art (Remotion)

A self-contained [Remotion](https://www.remotion.dev) project that renders every
store + web visual for doku+ from the app's own design tokens (the "Flight Deck"
palette, the paper-jet logo, Space Grotesk + JetBrains Mono). It's isolated from
the app — it has its own `package.json` and never touches the Vite/Capacitor
build.

The signature piece is a sudoku board tilted back in real 3D with the jet
**hovering above the board surface** (CSS `perspective` + `translateZ`, so it
casts a shadow that glides across the grid), flying a path that lands digits,
then a phase that recolors the whole scene through all five themes.

## Render everything

```bash
cd marketing
npm install          # first time only (downloads Remotion + a headless Chromium)
npm run all          # all stills + the hero video -> ./out
```

Individual targets: `npm run stills`, `npm run video:hero`, `npm run still:og`,
`npm run still:feature`, `npm run ios:1`…`ios:5`, `npm run android:1`…`android:5`.
Open the visual editor with `npm run studio`.

Pre-rendered output is committed under [`out/`](./out) so you can grab files
without installing anything.

## What gets produced & where each file goes

| File | Size | Drop it into |
| --- | --- | --- |
| `out/ios/01-hero … 05-clean.png` | 1320×2868 | **App Store Connect → [app] → Screenshots → iPhone 6.9"**. One 6.9" set covers every iPhone. |
| `out/play/01-hero … 05-clean.png` | 1080×1920 | **Play Console → Main store listing → Phone screenshots** (need ≥2; we give 5). |
| `out/play/feature-graphic.png` | 1024×500 | **Play Console → Main store listing → Feature graphic** (required). |
| `out/icon-1024.png` | 1024×1024 | **App Store Connect → App information → App icon** (no alpha — this PNG has none). |
| `out/icon-512.png` | 512×512 | **Play Console → Main store listing → App icon**. |
| `out/hero-flight.mp4` | 1080×1920, 14s | **App Preview** (iOS) / **Promo video** (Play, via a YouTube link) / social. |
| `public/og-image.png` | 1200×630 | Already wired into the website `<head>` for link previews. |

## The full store-submission asset checklist

Beyond the art in this folder, a first submission also needs:

**Apple App Store**
- App icon 1024×1024 (✅ `icon-1024.png`)
- iPhone 6.9" screenshots, 1–10 (✅ 5 provided). iPad screenshots only if you ship iPad.
- Optional App Preview video, 15–30s, portrait (use/trim `hero-flight.mp4`).
- Text you write in App Store Connect: name (≤30), subtitle (≤30), promotional
  text, description, keywords (≤100), support URL, privacy policy URL.
- A privacy "nutrition label" (App Privacy questionnaire).

**Google Play**
- App icon 512×512 (✅ `icon-512.png`)
- Feature graphic 1024×500 (✅ `feature-graphic.png`)
- Phone screenshots, 2–8 (✅ 5 provided)
- Optional 7"/10" tablet screenshots if you target tablets.
- Text: app name (≤30), short description (≤80), full description (≤4000).
- Privacy policy URL, content rating questionnaire, Data safety form.

## Specs / sources (2026)
- iOS 6.9" screenshots are 1320×2868; one set scales to all iPhones. PNG/JPEG,
  RGB, **no alpha**, exact pixel size.
- Play feature graphic is exactly 1024×500; keep key content in the centered
  924×400 safe area (Play overlays a play button and may crop edges).
- Play phone screenshots: aspect ratio between 9:16 and 9:21; 320–3840px per side.

## Editing the art
- Colors/logo/fonts: `src/theme.ts`, full theme palettes: `src/palettes.ts`.
- The 3D board + elevated jet: `src/components/Board3D.tsx`, `Plane.tsx`, `Grid.tsx`.
- Screenshot layouts: `src/Poster.tsx`. Landscape banner (feature + OG): `src/Banner.tsx`.
- The animation timeline (intro → flight → palette showcase → outro): `src/HeroFlight.tsx`.
- Board data / flight path: `src/sudoku.ts`.

> Note on the jet glow: the craft lives inside a `preserve-3d` context, where
> Chromium clips CSS `filter` output to the element box (a soft glow then shows a
> hard square edge). `Plane.tsx` avoids this with a large transparent containing
> box + self-terminating gradients instead of `drop-shadow`. Keep that pattern if
> you edit it.
