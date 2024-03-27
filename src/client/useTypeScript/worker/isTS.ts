// Returns true if the file name ends with `.ts` or `.tsx`.
export const isTS = (fileName: string) =>
  fileName.endsWith('.ts') || fileName.endsWith('.tsx');
