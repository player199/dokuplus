// Capacitor configuration for the native iOS/Android builds.
// See MOBILE.md for the full setup. Kept import-free so it never affects the
// web build; Capacitor's CLI reads it directly.
const config = {
  appId: 'app.dokuplus',
  appName: 'doku+',
  webDir: 'dist',
  backgroundColor: '#060a12',
  // 'never' = the webview spans the full screen and CSS owns all safe-area
  // spacing via env(safe-area-inset-*). 'always' would inset natively too,
  // double-counting the bottom inset and leaving dead space. See index.css .app.
  ios: { contentInset: 'never' },
};

export default config;
