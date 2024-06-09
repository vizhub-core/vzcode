// replace .js or .jsx with .ts or .tsx,
// to support TypeScript completions on non-TS files.
export const getTSFileName = (fileName: string) =>
  fileName.replace(/\.jsx?$/, '.tsx');
