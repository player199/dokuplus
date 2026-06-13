import React from 'react';
import { Composition, Still } from 'remotion';
import { HeroFlight, HERO_DURATION } from './HeroFlight';
import { Poster } from './Poster';
import { Banner } from './Banner';
import { AppIcon } from './AppIcon';

// Store + web art sizes (2026 specs):
//  - iOS screenshots: 1320x2868 (6.9" — one set covers every iPhone).
//  - Play phone screenshots: 1080x1920 (9:16, inside Play's 9:16–9:21 range).
//  - Play feature graphic: 1024x500 (required).
//  - OG / Twitter card: 1200x630.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* The hero animation — vertical, doubles as an App Preview / promo video. */}
      <Composition
        id="HeroFlight"
        component={HeroFlight}
        durationInFrames={HERO_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* iOS App Store screenshots (1320x2868) */}
      <Still id="Poster-Hero" component={Poster} width={1320} height={2868} defaultProps={{ variant: 'hero' as const }} />
      <Still id="Poster-Fly" component={Poster} width={1320} height={2868} defaultProps={{ variant: 'fly' as const }} />
      <Still id="Poster-Daily" component={Poster} width={1320} height={2868} defaultProps={{ variant: 'daily' as const }} />
      <Still id="Poster-Themes" component={Poster} width={1320} height={2868} defaultProps={{ variant: 'themes' as const }} />
      <Still id="Poster-Clean" component={Poster} width={1320} height={2868} defaultProps={{ variant: 'clean' as const }} />

      {/* Google Play phone screenshots (1080x1920) */}
      <Still id="Android-Hero" component={Poster} width={1080} height={1920} defaultProps={{ variant: 'hero' as const }} />
      <Still id="Android-Fly" component={Poster} width={1080} height={1920} defaultProps={{ variant: 'fly' as const }} />
      <Still id="Android-Daily" component={Poster} width={1080} height={1920} defaultProps={{ variant: 'daily' as const }} />
      <Still id="Android-Themes" component={Poster} width={1080} height={1920} defaultProps={{ variant: 'themes' as const }} />
      <Still id="Android-Clean" component={Poster} width={1080} height={1920} defaultProps={{ variant: 'clean' as const }} />

      {/* Play feature graphic + website OG image */}
      <Still id="Feature-Graphic" component={Banner} width={1024} height={500} defaultProps={{ tagline: true }} />
      <Still id="OG-Image" component={Banner} width={1200} height={630} defaultProps={{ tagline: true }} />

      {/* Store app icons (iOS 1024 no-alpha, Play 512) */}
      <Still id="App-Icon-iOS" component={AppIcon} width={1024} height={1024} />
      <Still id="App-Icon-Play" component={AppIcon} width={512} height={512} />
    </>
  );
};
