// Capacitor configuration for the native iOS/Android builds.
// See MOBILE.md for the full setup. Kept import-free so it never affects the
// web build; Capacitor's CLI reads it directly.
const config = {
  appId: 'app.dokuplus',
  appName: 'doku+',
  webDir: 'dist',
  backgroundColor: '#060a12',
  ios: { contentInset: 'always' },
};

export default config;
