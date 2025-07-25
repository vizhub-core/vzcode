/**
 * Utility function to extract file extension from a file name.
 * @param fileName - The name of the file (e.g., "index.html", "script.js")
 * @returns The file extension without the dot (e.g., "html", "js") or undefined if no extension
 */
export const getFileExtension = (
  fileName: string,
): string | undefined => {
  return fileName.split('.').pop();
};
