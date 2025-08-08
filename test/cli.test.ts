import { describe, it, expect } from 'vitest';
import { spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('VZCode CLI', () => {
  it('should show help when --help flag is used', async () => {
    const cliPath = path.join(
      __dirname,
      '..',
      'dist',
      'cli.js',
    );

    return new Promise<void>((resolve, reject) => {
      const child = spawn('node', [cliPath, '--help']);
      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        try {
          expect(code).toBe(0);
          expect(output).toContain(
            'VZCode - Multiplayer Code Editor',
          );
          expect(output).toContain(
            'Usage: vzcode [options]',
          );
          expect(output).toContain('--help, -h');
          expect(output).toContain('--browser');
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      child.on('error', reject);

      // Timeout after 10 seconds
      setTimeout(() => {
        child.kill();
        reject(new Error('CLI help test timed out'));
      }, 10000);
    });
  });

  it('should respect current working directory', async () => {
    const cliPath = path.join(
      __dirname,
      '..',
      'dist',
      'cli.js',
    );
    const testDir = path.join(
      '/tmp',
      'vzcode-cli-test-' + Date.now(),
    );

    // Create test directory with a unique file
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(
      path.join(testDir, 'test.js'),
      'console.log("test");',
    );

    return new Promise<void>((resolve, reject) => {
      const child = spawn('node', [cliPath, '--browser'], {
        cwd: testDir,
      });
      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      // Kill the process after 5 seconds to check output
      setTimeout(() => {
        child.kill();

        try {
          // Check that the output indicates the correct working directory
          expect(output).toContain(
            `Starting VZCode server from: ${testDir}`,
          );

          // Cleanup
          fs.rmSync(testDir, {
            recursive: true,
            force: true,
          });
          resolve();
        } catch (error) {
          // Cleanup on error
          fs.rmSync(testDir, {
            recursive: true,
            force: true,
          });
          reject(error);
        }
      }, 5000);

      child.on('error', (error) => {
        // Cleanup on error
        fs.rmSync(testDir, {
          recursive: true,
          force: true,
        });
        reject(error);
      });
    });
  }, 15000); // 15 second timeout for this test
});
