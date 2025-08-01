/**
 * Utility function to check if a file is an image based on its name.
 * @param fileName - The name of the file (e.g., "image.png", "photo.jpg")
 * @returns true if the file is an image, false otherwise
 */
export const isImageFile = (fileName: string): boolean => {
  return (
    fileName.match(
      /\.(png|jpg|jpeg|gif|bmp|svg|webp)$/i,
    ) !== null
  );
};
