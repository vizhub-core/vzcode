export const enableLiveKit =
  import.meta.env.VITE_ENABLE_LIVEKIT === 'true';

export const enableAIChat = true;

export const enableDiffView = true;

export const enableAskMode = false;

// Phase 0: Feature flag for minimal AI edit flow
export const enableMinimalEditFlow = true;

// If true, only include the minimal set of extensions,
// namely only the JSON1 OT extension and that's it.
// This is useful for testing and debugging the OT functionality
// without any other extensions getting in the way,
// just to rule them out as the source of a bug.
export const MINIMAL_EXTENSIONS = false;
