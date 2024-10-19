// Feature flag for directories, disabled until it's fully working.
export const enableDirectories = true;

export const debugDirectories = Boolean(
  process.env.DEBUG_FILE_TREE,
);

export const debugIgnore = Boolean(
  process.env.DEBUG_IGNORE,
);
