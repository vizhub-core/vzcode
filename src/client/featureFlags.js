// A feature flag to disable settings for release, until it's completed.
// See https://vitejs.dev/guide/env-and-mode.html
export const disableSettings =
  import.meta.env.VITE_DISABLE_SETTINGS === 'true';

// Useful for debugging dual split pane functionality.
// We may want to add this as an actual VZCode feature,
// for running the code that the VZCode user is developing
// in the same browser window as the VZCode editor,
// so that multiple browser windows are not required.
// so that multiple browser windows are not required.
export const enableRightPanel =
  import.meta.env.VITE_ENABLE_RIGHT_PANEL === 'true';

// Displays the Vite devserver iframe.
// TODO test this out, think this through.
// Purpose: support folks using VZCode as the editor
// for their Vite-based projects.
export const enableIframe =
  import.meta.env.VITE_ENABLE_IFRAME === 'true';

const debugFeatureFlags =
  import.meta.env.VITE_DEBUG_FEATURE_FLAGS === 'true';

if (debugFeatureFlags) {
  import('./featureFlags').then((featureFlags) =>
    console.log('featureFlags: ', { ...featureFlags }),
  );
}
