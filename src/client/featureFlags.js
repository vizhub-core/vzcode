// A feature flag to disable settings for release, until it's completed.
// See https://vitejs.dev/guide/env-and-mode.html
export const disableSettings =
  import.meta.env.VITE_DISABLE_SETTINGS === 'true';

// Displays the Vite devserver iframe.
// TODO test this out, think this through.
// Purpose: support folks using VZCode as the editor
// for their Vite-based projects.
export const enableIframe =
  import.meta.env.VITE_ENABLE_IFRAME === 'true';
