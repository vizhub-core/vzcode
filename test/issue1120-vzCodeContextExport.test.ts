import { describe, it, expect } from 'vitest';

/**
 * Test that verifies the issue described in the problem statement is resolved.
 * 
 * The issue was: Module '"vzcode"' has no exported member 'VZCodeContext'
 * 
 * We want to be able to do:
 * import {
 *   VZCodeProvider,
 *   VZCodeContext,
 *   VZResizer,
 *   VZLeft,
 *   VZMiddle,
 * } from 'vzcode';
 */
describe('Issue #1120: Add VZCodeContext export', () => {
  it('should be able to import all required components from vzcode package', async () => {
    // Import the main package
    const vzcode = await import('../src/index.ts');
    
    // Test that all the components mentioned in the issue are available
    expect(vzcode.VZCodeProvider).toBeDefined();
    expect(vzcode.VZCodeContext).toBeDefined(); // This was missing and is now fixed
    expect(vzcode.VZResizer).toBeDefined();
    expect(vzcode.VZLeft).toBeDefined();
    expect(vzcode.VZMiddle).toBeDefined();
    
    // Verify their types
    expect(typeof vzcode.VZCodeProvider).toBe('function'); // React component
    expect(typeof vzcode.VZCodeContext).toBe('object');    // React context
    expect(typeof vzcode.VZResizer).toBe('function');      // React component
    expect(typeof vzcode.VZLeft).toBe('function');         // React component 
    expect(typeof vzcode.VZMiddle).toBe('function');       // React component
  });

  it('should allow destructuring import as shown in the issue', async () => {
    // Test the exact import pattern from the issue description
    const {
      VZCodeProvider,
      VZCodeContext,
      VZResizer,
      VZLeft,
      VZMiddle,
    } = await import('../src/index.ts');
    
    // All should be defined
    expect(VZCodeProvider).toBeDefined();
    expect(VZCodeContext).toBeDefined();
    expect(VZResizer).toBeDefined();
    expect(VZLeft).toBeDefined();
    expect(VZMiddle).toBeDefined();
    
    // VZCodeContext should be a React Context object
    expect(VZCodeContext).toHaveProperty('Provider');
    expect(VZCodeContext).toHaveProperty('Consumer');
    expect(typeof VZCodeContext.Provider).toBe('object');
  });
});