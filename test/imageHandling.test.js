import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { computeInitialDocument } from '../src/server/computeInitialDocument.js';

describe('Image File Handling', () => {
  const testDir = '/tmp/imageTest';
  const testImagePath = path.join(testDir, 'test.png');
  const testTextPath = path.join(testDir, 'test.txt');
  
  // This is a minimal 1x1 pixel PNG as base64
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGAnqnXAAAAElFTkSuQmCC';
  const testTextContent = 'This is a test text file.';

  beforeEach(() => {
    // Create test directory and files
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    // Create test image file from base64
    const imageBuffer = Buffer.from(testImageBase64, 'base64');
    fs.writeFileSync(testImagePath, imageBuffer);
    
    // Create test text file
    fs.writeFileSync(testTextPath, testTextContent);
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should read image files as base64', () => {
    const initialDocument = computeInitialDocument({ fullPath: testDir });
    
    // Find the image file in the document
    const imageFile = Object.values(initialDocument.files).find(
      file => file.name === 'test.png'
    );
    
    expect(imageFile).toBeDefined();
    expect(imageFile.text).toBe(testImageBase64);
  });

  it('should read text files as UTF-8', () => {
    const initialDocument = computeInitialDocument({ fullPath: testDir });
    
    // Find the text file in the document
    const textFile = Object.values(initialDocument.files).find(
      file => file.name === 'test.txt'
    );
    
    expect(textFile).toBeDefined();
    expect(textFile.text).toBe(testTextContent);
  });

  it('should handle mixed file types correctly', () => {
    const initialDocument = computeInitialDocument({ fullPath: testDir });
    
    expect(Object.keys(initialDocument.files)).toHaveLength(2);
    
    const files = Object.values(initialDocument.files);
    const imageFile = files.find(file => file.name === 'test.png');
    const textFile = files.find(file => file.name === 'test.txt');
    
    expect(imageFile.text).toBe(testImageBase64);
    expect(textFile.text).toBe(testTextContent);
  });
});