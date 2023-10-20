import { describe, expect, it } from 'vitest';
import {vizhubTheme} from '../../src/client/themes/vizhubTheme';

const defaultRotation = 0.397;

describe.only('vizhub theme', () => {
  it('Generates hex colors', () => {
    const theme = vizhubTheme(defaultRotation);

    console.log(theme)
    // Clone to guard mutation.
    // const tree = clone(complexTreeUnsorted);

    // expect(tree).toEqual(complexTreeUnsorted);
    // sortFileTree(tree);
    // expect(tree).toEqual(complexTreeSorted);
  });
});
