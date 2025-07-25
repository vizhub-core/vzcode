/**
 *patterns describing which files should e comsidered as ignore files when creating the file tree.
 *
 * Format: one pattern per line, in gitignore format as defimed by https://git-scm.com/docs/gitignore#_pattern_format
 */
export const ignoreFilePattern =
  process.env.IGNORE_FILE_PATTERN ??
  `
.vzignore
.ignore
.gitignore
`;

/**
 * the base ignore patterns, that should be applied before any ignore file found when creating the file tree.
 *
 * These patterns apply even in the absence of an ignore file.
 */
export const baseIgnore =
  process.env.BASE_IGNORE ??
  `
.git/
node_modules/
`;
