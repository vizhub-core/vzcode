#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to find the Tauri binary
function findTauriApp(): string | null {
  // Look for the Tauri binary in common locations
  const possiblePaths = [
    // Development location (when running from source)
    path.join(
      __dirname,
      '..',
      'src-tauri',
      'target',
      'debug',
      'vzcode',
    ),
    path.join(
      __dirname,
      '..',
      'src-tauri',
      'target',
      'debug',
      'vzcode.exe',
    ),
    // Release location (when running from built package)
    path.join(
      __dirname,
      '..',
      'src-tauri',
      'target',
      'release',
      'vzcode',
    ),
    path.join(
      __dirname,
      '..',
      'src-tauri',
      'target',
      'release',
      'vzcode.exe',
    ),
    // MacOS app bundle
    path.join(
      __dirname,
      '..',
      'src-tauri',
      'target',
      'debug',
      'vzcode.app',
      'Contents',
      'MacOS',
      'vzcode',
    ),
    path.join(
      __dirname,
      '..',
      'src-tauri',
      'target',
      'release',
      'vzcode.app',
      'Contents',
      'MacOS',
      'vzcode',
    ),
  ];

  for (const binaryPath of possiblePaths) {
    if (fs.existsSync(binaryPath)) {
      return binaryPath;
    }
  }

  return null;
}

// Function to launch the Tauri app
function launchTauriApp(workingDirectory: string): void {
  const tauriBinary = findTauriApp();

  if (!tauriBinary) {
    console.error(
      'VZCode desktop app not found. Please build it first with: npm run tauri:build',
    );
    console.error(
      'Falling back to launching browser version...',
    );
    launchBrowserVersion(workingDirectory);
    return;
  }

  console.log(
    `Launching VZCode desktop app from: ${workingDirectory}`,
  );

  // First start the server in the background
  startServerInBackground(workingDirectory);

  // Give the server a moment to start, then launch Tauri
  setTimeout(() => {
    const child = spawn(tauriBinary, [], {
      cwd: workingDirectory,
      stdio: 'inherit',
      detached: true,
    });

    // Allow the parent process to exit while keeping the child running
    child.unref();
  }, 2000);
}

// Function to start the server in the background
function startServerInBackground(
  workingDirectory: string,
): void {
  // Start the server process in the background
  const serverPath = path.join(
    __dirname,
    'server',
    'index.js',
  );
  const serverChild = spawn('node', [serverPath], {
    cwd: workingDirectory,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });

  // Don't block on the server process
  serverChild.unref();

  // Log server output for debugging
  if (serverChild.stdout) {
    serverChild.stdout.on('data', (data) => {
      console.log('Server:', data.toString());
    });
  }

  if (serverChild.stderr) {
    serverChild.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });
  }
}

// Fallback function to launch the browser version
async function launchBrowserVersion(
  workingDirectory: string,
): Promise<void> {
  // Note: The server/index.js will use process.cwd() automatically
  // and we're already in the correct working directory
  console.log(
    `Starting VZCode server from: ${workingDirectory}`,
  );
}

// Main CLI function
function main(): void {
  const workingDirectory = process.cwd();

  // Parse command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('VZCode - Multiplayer Code Editor');
    console.log('');
    console.log('Usage: vzcode [options]');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h     Show this help message');
    console.log(
      '  --browser      Force browser version instead of desktop app',
    );
    console.log(
      '  --port=<port>  Specify port for server (default: 3030)',
    );
    console.log('');
    console.log('Examples:');
    console.log(
      '  vzcode                    # Launch desktop app in current directory',
    );
    console.log(
      '  vzcode --browser          # Launch browser version',
    );
    console.log(
      '  vzcode --port=4000        # Start server on port 4000',
    );
    return;
  }

  if (args.includes('--browser')) {
    launchBrowserVersion(workingDirectory);
  } else {
    launchTauriApp(workingDirectory);
  }
}

// Run the CLI
main();
