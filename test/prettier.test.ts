import {
  formatFile,
  formatFiles,
} from '../src/server/prettier.js';
import { describe, it, expect } from 'vitest';

describe('Server-side Prettier Integration', () => {
  it('should format JavaScript code correctly', async () => {
    const unformattedJS = `const x=1;let y = {    a:1,b:2,   c:3};console.log(x,y);`;
    const result = await formatFile(
      unformattedJS,
      'test.js',
    );

    expect(result).toBeTruthy();
    expect(result).toContain('const x = 1;');
    expect(result).toMatch(
      /let y = \{\s*a: 1,\s*b: 2,\s*c: 3,?\s*\};/,
    );
  });

  it('should format TypeScript code correctly', async () => {
    const unformattedTS = `interface User{name:string;age:number;}const user:User={name:"test",age:25};`;
    const result = await formatFile(
      unformattedTS,
      'test.ts',
    );

    expect(result).toBeTruthy();
    expect(result).toContain('interface User {');
    expect(result).toContain('name: string;');
    expect(result).toContain('age: number;');
  });

  it('should format CSS code correctly', async () => {
    const unformattedCSS = `.container{display:flex;margin:0;padding:10px;}`;
    const result = await formatFile(
      unformattedCSS,
      'test.css',
    );

    expect(result).toBeTruthy();
    expect(result).toContain('.container {');
    expect(result).toContain('display: flex;');
  });

  it('should return null for unsupported file types', async () => {
    const result = await formatFile(
      'some content',
      'test.txt',
    );
    expect(result).toBeNull();
  });

  it('should format multiple files correctly', async () => {
    const files = {
      file1: {
        name: 'script.js',
        text: `const x=1;let y=2;`,
      },
      file2: {
        name: 'style.css',
        text: `.test{color:red;margin:0;}`,
      },
      file3: {
        name: 'data.txt',
        text: 'some text',
      },
    };

    const results = await formatFiles(files);

    expect(results['file1']).toBeTruthy();
    expect(results['file1']).toContain('const x = 1;');
    expect(results['file2']).toBeTruthy();
    expect(results['file2']).toContain('.test {');
    expect(results['file3']).toBeUndefined(); // No formatter for .txt files
  });
});
