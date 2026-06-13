import { Config } from '@remotion/cli/config';

// --- stills (store screenshots, feature graphic, OG image) ---
// Rendered straight at native store dimensions (no upscale — the stores want
// EXACT pixel sizes), with PNG output for crisp text and flat color.
Config.setVideoImageFormat('png'); // lossless frames feeding the encoder
Config.setOverwriteOutput(true);

// --- video (HeroFlight) quality ---
// CRF 16 is visually lossless for this kind of flat, high-contrast UI art;
// the slow x264 preset spends more time for smaller, cleaner files; bt709 is
// the correct color space for SDR video and what the stores expect.
Config.setCodec('h264');
Config.setCrf(16);
Config.setColorSpace('bt709');
Config.setX264Preset('slow');
