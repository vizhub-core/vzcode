import { describe, it, expect } from 'vitest';

// Mock the feature flag module to test both enabled and disabled states
describe('Ask Mode Feature Flag', () => {
  it('should export enableAskMode as false by default', async () => {
    const { enableAskMode } = await import('../src/client/featureFlags');
    expect(enableAskMode).toBe(false);
  });

  it('should have the correct type for enableAskMode', async () => {
    const { enableAskMode } = await import('../src/client/featureFlags');
    expect(typeof enableAskMode).toBe('boolean');
  });
});