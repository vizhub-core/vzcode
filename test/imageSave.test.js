import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock the image file detection function
const isImageFile = (fileName) => {
  return fileName.match(/\.(png|jpg|jpeg|gif|bmp|svg|webp)$/i) !== null;
};

describe('Image File Save Functionality', () => {
  const testDir = '/tmp/imageSaveTest';
  const testImagePath = path.join(testDir, 'saved.png');
  
  // This is a minimal 1x1 pixel PNG as base64
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGAnqnXAAAAElFTkSuQmCC';

  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should save image files as binary from base64', () => {
    // Simulate the save logic from index.ts
    if (isImageFile('saved.png')) {
      // Write image files as binary from base64
      const buffer = Buffer.from(testImageBase64, 'base64');
      fs.writeFileSync(testImagePath, buffer);
    }
    
    // Verify the file was written correctly
    expect(fs.existsSync(testImagePath)).toBe(true);
    
    // Read it back and verify it matches our original
    const savedBuffer = fs.readFileSync(testImagePath);
    const savedBase64 = savedBuffer.toString('base64');
    
    expect(savedBase64).toBe(testImageBase64);
  });

  it('should round-trip image files correctly', () => {
    // Write base64 → binary
    const buffer = Buffer.from(testImageBase64, 'base64');
    fs.writeFileSync(testImagePath, buffer);
    
    // Read binary → base64 (like computeInitialDocument.ts does)
    const readBuffer = fs.readFileSync(testImagePath);
    const readBase64 = readBuffer.toString('base64');
    
    // Should match exactly
    expect(readBase64).toBe(testImageBase64);
  });
});