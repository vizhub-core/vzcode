import { describe, it } from 'vitest';
import { vizhubThemeColorsComputation } from './vizhubThemeColorsComputation';

const defaultRotation = 0.397;

describe.skip('vizhub theme', () => {
  it('Generates hex colors', () => {
    const vizhubThemeColors =
      vizhubThemeColorsComputation(defaultRotation);

    // Paste this into vizhubThemeColors.ts
    console.log(
      `const vizhubThemeColors = ${JSON.stringify(
        vizhubThemeColors,
        null,
        2,
      )}`,
    );
  });
});
