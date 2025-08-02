import { describe, it, expect, vi } from 'vitest';
import { generateRunId } from '@vizhub/viz-utils';

describe('runId triggering functionality', () => {
  it('should generate valid runIds', () => {
    const runId1 = generateRunId();
    const runId2 = generateRunId();

    // runIds should be 8-character hex strings
    expect(runId1).toMatch(/^[0-9a-f]{8}$/);
    expect(runId2).toMatch(/^[0-9a-f]{8}$/);

    // runIds should be different
    expect(runId1).not.toBe(runId2);
  });

  it('should handle runId changes in VZRight component logic', () => {
    let lastRunId = undefined;
    const runId1 = generateRunId();
    const runId2 = generateRunId();

    // Simulate the runId change detection logic from VZRight
    const checkRunIdChanged = (currentRunId) => {
      const changed = currentRunId !== lastRunId;
      if (changed) {
        lastRunId = currentRunId;
      }
      return changed;
    };

    // First runId should be detected as changed
    expect(checkRunIdChanged(runId1)).toBe(true);

    // Same runId should not be detected as changed
    expect(checkRunIdChanged(runId1)).toBe(false);

    // Different runId should be detected as changed
    expect(checkRunIdChanged(runId2)).toBe(true);

    // Same runId again should not be detected as changed
    expect(checkRunIdChanged(runId2)).toBe(false);
  });

  it('should determine correct hot reloading settings', () => {
    // Simulate the hot reloading logic from VZRight
    const getHotReloadingSetting = (
      isInteracting,
      runIdChanged,
    ) => {
      // Enable hot reloading when interacting, disable when runId changed without interaction
      return isInteracting;
    };

    // When user is interacting, hot reloading should be enabled
    expect(getHotReloadingSetting(true, false)).toBe(true);
    expect(getHotReloadingSetting(true, true)).toBe(true);

    // When user is not interacting, hot reloading should be disabled
    expect(getHotReloadingSetting(false, false)).toBe(
      false,
    );
    expect(getHotReloadingSetting(false, true)).toBe(false);
  });

  it('should determine when to trigger runs', () => {
    // Simulate the run triggering logic from VZRight
    const shouldTriggerRun = (
      isFirstRun,
      isInteracting,
      runIdChanged,
    ) => {
      return isFirstRun || isInteracting || runIdChanged;
    };

    // First run should always trigger
    expect(shouldTriggerRun(true, false, false)).toBe(true);
    expect(shouldTriggerRun(true, true, false)).toBe(true);
    expect(shouldTriggerRun(true, false, true)).toBe(true);
    expect(shouldTriggerRun(true, true, true)).toBe(true);

    // After first run, should trigger when interacting
    expect(shouldTriggerRun(false, true, false)).toBe(true);
    expect(shouldTriggerRun(false, true, true)).toBe(true);

    // After first run, should trigger when runId changes
    expect(shouldTriggerRun(false, false, true)).toBe(true);

    // Should not trigger when nothing changed
    expect(shouldTriggerRun(false, false, false)).toBe(
      false,
    );
  });
});
