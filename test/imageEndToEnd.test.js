import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { computeInitialDocument } from '../src/server/computeInitialDocument.js';

// Import the image file detection function like the server does
const isImageFile = (fileName) => {
  return fileName.match(/\.(png|jpg|jpeg|gif|bmp|svg|webp)$/i) !== null;
};

describe('End-to-End Image File Handling', () => {
  const testDir = '/tmp/e2eImageTest';
  const testImagePath = path.join(testDir, 'example.png');
  const testTextPath = path.join(testDir, 'example.txt');
  
  // This is a minimal 1x1 pixel PNG as base64
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGAnqnXAAAAElFTkSuQmCC';
  const testTextContent = 'Hello, world!';

  beforeEach(() => {
    // Create test directory and files
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    // Create original image file from base64
    const imageBuffer = Buffer.from(testImageBase64, 'base64');
    fs.writeFileSync(testImagePath, imageBuffer);
    
    // Create original text file
    fs.writeFileSync(testTextPath, testTextContent);
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should handle complete read → modify → write cycle for images', () => {
    // Step 1: Read files from disk (like computeInitialDocument.ts)
    const initialDocument = computeInitialDocument({ fullPath: testDir });
    
    // Verify we have both files
    expect(Object.keys(initialDocument.files)).toHaveLength(2);
    
    const files = Object.values(initialDocument.files);
    const imageFile = files.find(file => file.name === 'example.png');
    const textFile = files.find(file => file.name === 'example.txt');
    
    // Verify image is base64 and text is UTF-8
    expect(imageFile.text).toBe(testImageBase64);
    expect(textFile.text).toBe(testTextContent);
    
    // Step 2: Simulate modifying the image (e.g., user uploads a new image)
    // Create a different 1x1 pixel PNG (red instead of transparent)
    const newImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    imageFile.text = newImageBase64;
    
    // Step 3: Save the modified image back to disk (like index.ts save function)
    const modifiedImagePath = path.join(testDir, 'modified.png');
    
    if (isImageFile('modified.png')) {
      // Write image files as binary from base64
      const buffer = Buffer.from(imageFile.text, 'base64');
      fs.writeFileSync(modifiedImagePath, buffer);
    }
    
    // Step 4: Verify the file was written correctly by reading it back
    const savedBuffer = fs.readFileSync(modifiedImagePath);
    const savedBase64 = savedBuffer.toString('base64');
    
    expect(savedBase64).toBe(newImageBase64);
    
    // Step 5: Verify we can read it back with computeInitialDocument
    const rereadDocument = computeInitialDocument({ fullPath: testDir });
    const rereadFiles = Object.values(rereadDocument.files);
    const rereadModified = rereadFiles.find(file => file.name === 'modified.png');
    
    expect(rereadModified.text).toBe(newImageBase64);
  });

  it('should preserve non-image files as text throughout the cycle', () => {
    // Read original document
    const initialDocument = computeInitialDocument({ fullPath: testDir });
    
    const files = Object.values(initialDocument.files);
    const textFile = files.find(file => file.name === 'example.txt');
    
    expect(textFile.text).toBe(testTextContent);
    
    // Modify text content
    const newTextContent = 'Modified content!';
    textFile.text = newTextContent;
    
    // Save text file (should not use base64 conversion)
    const modifiedTextPath = path.join(testDir, 'modified.txt');
    
    if (!isImageFile('modified.txt')) {
      // Write non-image files as text
      fs.writeFileSync(modifiedTextPath, textFile.text);
    }
    
    // Verify it was written as text
    const savedText = fs.readFileSync(modifiedTextPath, 'utf-8');
    expect(savedText).toBe(newTextContent);
    
    // Verify we can read it back correctly
    const rereadDocument = computeInitialDocument({ fullPath: testDir });
    const rereadFiles = Object.values(rereadDocument.files);
    const rereadModified = rereadFiles.find(file => file.name === 'modified.txt');
    
    expect(rereadModified.text).toBe(newTextContent);
  });
});