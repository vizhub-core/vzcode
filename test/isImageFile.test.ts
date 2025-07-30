import { describe, it, expect } from 'vitest';
import { isImageFile } from '../src/client/utils/isImageFile';

describe('isImageFile', () => {
  it('should return true for PNG files', () => {
    expect(isImageFile('test.png')).toBe(true);
    expect(isImageFile('image.PNG')).toBe(true);
  });

  it('should return true for JPG files', () => {
    expect(isImageFile('photo.jpg')).toBe(true);
    expect(isImageFile('image.jpeg')).toBe(true);
    expect(isImageFile('picture.JPEG')).toBe(true);
  });

  it('should return true for other supported image formats', () => {
    expect(isImageFile('icon.gif')).toBe(true);
    expect(isImageFile('bitmap.bmp')).toBe(true);
    expect(isImageFile('vector.svg')).toBe(true);
    expect(isImageFile('modern.webp')).toBe(true);
  });

  it('should return false for non-image files', () => {
    expect(isImageFile('script.js')).toBe(false);
    expect(isImageFile('style.css')).toBe(false);
    expect(isImageFile('document.txt')).toBe(false);
    expect(isImageFile('data.json')).toBe(false);
    expect(isImageFile('README.md')).toBe(false);
  });

  it('should return false for files without extensions', () => {
    expect(isImageFile('filename')).toBe(false);
    expect(isImageFile('')).toBe(false);
  });

  it('should handle files with multiple dots', () => {
    expect(isImageFile('my.image.png')).toBe(true);
    expect(isImageFile('my.script.js')).toBe(false);
  });
});
