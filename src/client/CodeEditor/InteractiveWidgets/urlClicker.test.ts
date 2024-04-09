import { describe, expect, test } from 'vitest';
import { urlClickerRegex } from './urlClicker';

describe('URL regex', () => {
  test.each([
    {
      name: 'standard URL',
      input:
        'Visit https://example.com for more information.',
      expected: ['https://example.com'],
    },
    {
      name: 'URL with single quote at the end',
      input: "Click here: https://example.com';",
      expected: ['https://example.com'],
    },
    {
      name: 'multiple URLs',
      input:
        'Check out https://site1.com and https://site2.com.',
      expected: ['https://site1.com', 'https://site2.com'],
    },
    {
      name: 'URL with query parameters',
      input:
        'Visit https://example.com?param1=value1&param2=value2.',
      expected: [
        'https://example.com?param1=value1&param2=value2',
      ],
    },
    {
      name: 'URL with parentheses',
      input:
        'See the map at https://example.com/maps?location=(123,456).',
      expected: [
        'https://example.com/maps?location=(123,456)',
      ],
    },
    {
      name: 'no URL present',
      input: 'This text does not contain a URL.',
      expected: [],
    },
  ])('$name', ({ input, expected }) => {
    const matches = input.match(urlClickerRegex) || [];
    expect(matches).toEqual(expected);
  });
});
