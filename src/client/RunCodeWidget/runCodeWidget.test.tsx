import { describe, it, expect, vi } from 'vitest';
import { createRunCodeFunction } from '../../runCode';

describe('createRunCodeFunction with hardRerun support', () => {
  it('creates a function that calls submitOperation with hardRerun=false by default', () => {
    const mockSubmitOperation = vi.fn();
    const runCode = createRunCodeFunction(mockSubmitOperation);

    // Call without arguments (default behavior)
    runCode();

    expect(mockSubmitOperation).toHaveBeenCalledWith(
      expect.any(Function)
    );

    // Test the actual function passed to submitOperation
    const submitFunction = mockSubmitOperation.mock.calls[0][0];
    const mockContent = { files: {}, someOtherProp: 'value' };
    const result = submitFunction(mockContent);

    expect(result).toEqual({
      ...mockContent,
      isInteracting: true,
      // hardRerun should not be added when false
    });
    expect(result).not.toHaveProperty('hardRerun');
  });

  it('creates a function that calls submitOperation with hardRerun=true when specified', () => {
    const mockSubmitOperation = vi.fn();
    const runCode = createRunCodeFunction(mockSubmitOperation);

    // Call with hardRerun=true
    runCode(true);

    expect(mockSubmitOperation).toHaveBeenCalledWith(
      expect.any(Function)
    );

    // Test the actual function passed to submitOperation
    const submitFunction = mockSubmitOperation.mock.calls[0][0];
    const mockContent = { files: {}, someOtherProp: 'value' };
    const result = submitFunction(mockContent);

    expect(result).toEqual({
      ...mockContent,
      isInteracting: true,
      hardRerun: true,
    });
  });

  it('cleans up both isInteracting and hardRerun properties after timeout', () => {
    return new Promise<void>((resolve) => {
      const mockSubmitOperation = vi.fn();
      const runCode = createRunCodeFunction(mockSubmitOperation);

      runCode(true);

      // After 100ms timeout, it should call submitOperation again to clean up
      setTimeout(() => {
        expect(mockSubmitOperation).toHaveBeenCalledTimes(2);
        
        // Test the cleanup function
        const cleanupFunction = mockSubmitOperation.mock.calls[1][0];
        const mockContentWithFlags = { 
          files: {}, 
          isInteracting: true, 
          hardRerun: true,
          someOtherProp: 'value' 
        };
        const result = cleanupFunction(mockContentWithFlags);

        expect(result).toEqual({
          files: {},
          someOtherProp: 'value',
        });
        expect(result).not.toHaveProperty('isInteracting');
        expect(result).not.toHaveProperty('hardRerun');
        resolve();
      }, 150); // Wait a bit longer than the 100ms timeout
    });
  });
});