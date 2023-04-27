// A feature flag to disable settings for release, until it's completed.
// See https://vitejs.dev/guide/env-and-mode.html
export const disableSettings = import.meta.env.VITE_DISABLE_SETTINGS === 'true';

// Feature flag for directories, disabled until it's fully working.
export const enableDirectories = true;
