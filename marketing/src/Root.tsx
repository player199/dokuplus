import React from 'react';
import { Composition, Still } from 'remotion';
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
      {/* iOS App Store screenshots (1320x2868) */}
      <Still id="Poster-Hero" component={Poster} width={1320} height={2868} defaultProps={{ variant: 'hero' as const }} />
      <Still id="Poster-Fly" component={Poster} width={1320} height={2868} defaultProps={{ variant: 'fly' as const }} />
      <Still id="Poster-Daily" component={Poster} width={1320} height={2868} defaultProps={{ variant: 'daily' as const }} />
      <Still id="Poster-Themes" component={Poster} width={1320} height={2868} defaultProps={{ variant: 'themes' as const }} />
      <Still id="Poster-Clean" component={Poster} width={1320} height={2868} defaultProps={{ variant: 'clean' as const }} />

      {/* iPad 13" screenshots (2048×2732 portrait — covers 12.9" and 13") */}
      <Still id="iPad-Hero" component={Poster} width={2048} height={2732} defaultProps={{ variant: 'hero' as const }} />
      <Still id="iPad-Fly" component={Poster} width={2048} height={2732} defaultProps={{ variant: 'fly' as const }} />
      <Still id="iPad-Daily" component={Poster} width={2048} height={2732} defaultProps={{ variant: 'daily' as const }} />
      <Still id="iPad-Themes" component={Poster} width={2048} height={2732} defaultProps={{ variant: 'themes' as const }} />
      <Still id="iPad-Clean" component={Poster} width={2048} height={2732} defaultProps={{ variant: 'clean' as const }} />

      {/* Google Play phone screenshots — identical to iOS. 1320x2868 is ratio
          9:19.5, inside Play's allowed 9:16–9:21, so we reuse the exact layout. */}
      <Still id="Android-Hero" component={Poster} width={1320} height={2868} defaultProps={{ variant: 'hero' as const }} />
      <Still id="Android-Fly" component={Poster} width={1320} height={2868} defaultProps={{ variant: 'fly' as const }} />
      <Still id="Android-Daily" component={Poster} width={1320} height={2868} defaultProps={{ variant: 'daily' as const }} />
      <Still id="Android-Themes" component={Poster} width={1320} height={2868} defaultProps={{ variant: 'themes' as const }} />
      <Still id="Android-Clean" component={Poster} width={1320} height={2868} defaultProps={{ variant: 'clean' as const }} />

      {/* Play feature graphic + website OG image */}
      <Still id="Feature-Graphic" component={Banner} width={1024} height={500} defaultProps={{ tagline: true }} />
      <Still id="OG-Image" component={Banner} width={1200} height={630} defaultProps={{ tagline: true }} />

      {/* Store app icons (iOS 1024 no-alpha, Play 512) */}
      <Still id="App-Icon-iOS" component={AppIcon} width={1024} height={1024} />
      <Still id="App-Icon-Play" component={AppIcon} width={512} height={512} />
    </>
  );
};
