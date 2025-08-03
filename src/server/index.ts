#!/usr/bin/env node
import WebSocketJSONStream from '@teamwork/websocket-json-stream';
import bodyParser from 'body-parser';
import express from 'express';
import fs from 'fs';
import http from 'http';
import open from 'open';
import path from 'path';
import ShareDB from 'sharedb';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { json1Presence } from '../ot.js';
import { computeInitialDocument } from './computeInitialDocument.js';
import { handleAIAssist } from './handleAIAssist.js';
import { handleAICopilot } from './handleAICopilot.js';
import { handleAIChatMessage } from './handleAIChatMessage.js';
import { handleAIChatUndo } from './handleAIChatUndo.js';
import { isDirectory } from './isDirectory.js';
import { createToken } from './livekit.js';
import './setupEnv.js';

// Import the image file utility
const isImageFile = (fileName) => {
  return (
    fileName.match(
      /\.(png|jpg|jpeg|gif|bmp|svg|webp)$/i,
    ) !== null
  );
};

// The time in milliseconds by which auto-saving is debounced.
const autoSaveDebounceTimeMS = 800;

// The time in milliseconds by which auto-saving is throttled
// when the user is interacting with the widgets in the editor.
const throttleTimeMS = 100;

// Helper function to get the port from command line arguments or use default.
function getPortFromArgs(defaultPort = 3030) {
  const portArg = process.argv.find((arg) =>
    arg.startsWith('--port='),
  );
  if (portArg) {
    return parseInt(portArg.split('=')[1], 10);
  }
  return defaultPort;
}

// Server port.
const port = getPortFromArgs();

const initialDocument = computeInitialDocument({
  // Use the current working directory to look for files.
  fullPath: process.cwd(),
});

// Register our custom OT type,
// because it does not ship with ShareDB.
ShareDB.types.register(json1Presence.type);

const app = express();

// Use ShareDB over WebSocket
const shareDBBackend = new ShareDB({
  // Enable presence
  // See https://github.com/share/sharedb/blob/master/examples/rich-text-presence/server.js#L9
  presence: true,
  doNotForwardSendPresenceErrorsToClient: true,
});
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
wss.on('connection', (ws) => {
  const clientStream = new WebSocketJSONStream(ws);
  shareDBBackend.listen(clientStream);

  // Prevent server crashes on errors.
  clientStream.on('error', (error) => {
    console.log('clientStream error: ' + error.message);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.log('ws error: ' + error.message);
  });

  // Handle disconnections
  ws.on('close', () => {
    clientStream.end();
  });
});

// Serve static files
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const dir = path.join(dirname, '..', '..', 'dist');
app.use(express.static(dir));

// Create the initial "document",
// which is a representation of files on disk.
const shareDBConnection = shareDBBackend.connect();
const shareDBDoc = shareDBConnection.get('documents', '1');

// Set up presence for VizBot following the same pattern as useShareDB.ts
const docPresence = shareDBConnection.getDocPresence(
  'documents',
  '1',
);

// Create local presence for VizBot with a unique ID
const generateVizBotId = () => {
  const timestamp = Date.now().toString(36);
  return `vizbot-${timestamp}`;
};

const createVizBotLocalPresence = () =>
  docPresence.create(generateVizBotId());

shareDBDoc.create(initialDocument, json1Presence.type.uri);

// Handle AI Assist requests.
app.post(
  '/ai-assist',
  bodyParser.json(),
  handleAIAssist(shareDBDoc),
);

// Handle AI Copilot requests.
app.post(
  '/ai-copilot',
  bodyParser.json(),
  handleAICopilot(),
);

// Handle AI Chat Message requests.
app.post(
  '/ai-chat-message',
  bodyParser.json(),
  handleAIChatMessage({
    shareDBDoc,
    createVizBotLocalPresence,
    onCreditDeduction: undefined,
  }),
);

// Handle AI Chat Undo requests.
app.post(
  '/ai-chat-undo',
  bodyParser.json(),
  handleAIChatUndo({
    shareDBDoc,
  }),
);

// Livekit Token Generator
app.get('/livekit-token', async (req, res) => {
  const { room, username } = req.query;
  res.send(await createToken(room, username));
});

// The state of the document when files were last auto-saved.
let previousDocument = initialDocument;

// Saves the files that changed.
const save = () => {
  const currentDocument = shareDBDoc.data;

  // Take a look at each file (key) previously and currently.
  const allKeys = Object.keys({
    ...currentDocument.files,
    ...previousDocument.files,
  });

  const directoriesToDelete = [];

  for (const key of allKeys) {
    const previous = previousDocument.files[key];
    const current = currentDocument.files[key];

    // If this file was neither created nor deleted...
    if (previous && current) {
      // Handle changing of text content.
      if (previous.text !== current.text) {
        if (isImageFile(current.name)) {
          // Write image files as binary from base64
          const buffer = Buffer.from(
            current.text,
            'base64',
          );
          fs.writeFileSync(current.name, buffer);
        } else {
          // Write non-image files as text
          fs.writeFileSync(current.name, current.text);
        }
      }

      // // Handle renaming files.
      // if (previous.name !== current.name) {

      //   const previousPath = previous.name.split('/');
      //   const currentPath = current.name.split('/');

      //   // - If the path is length 1 for previous and current,
      //   //   then this should be true.
      //   // - If the path length is the sane for previous and current,
      //   //   AND all the entries leading up to the last one are the same
      //   //   between previous and current, AND the last entry in the arrays
      //   //   (the file name itself) is different between previous and current
      //   const onlyFileNameChanged =
      //     (previousPath.length === 1 &&
      //       currentPath.length === 1) ||
      //     (previousPath.length === currentPath.length &&
      //       previousPath
      //         .slice(0, -1)
      //         .every(
      //           (val, index) => val === currentPath[index],
      //         ) &&
      //       previousPath.at(-1) !== currentPath.at(-1));

      //   // This logic works if only the file name itself changes.
      //   if (onlyFileNameChanged) {
      //     fs.renameSync(previous.name, current.name);
      //   }
      //   {
      //     // If we get here, then the directory may have been renamed,
      //     // or the file has been moved between directories.
      //     // If we get here, then the directory may have been renamed,
      //     // or the file has been moved between directories.
      //     const newDir = path.dirname(current.name);

      //     // Check if the new directory exists, if not, create it
      //     if (!fs.existsSync(newDir)) {
      //       fs.mkdirSync(newDir, { recursive: true });
      //     }

      //     // Move the file to the new directory
      //     fs.renameSync(previous.name, current.name);
      //   }
      // }
      // Handle renaming files.
      if (previous.name !== current.name) {
        if (isDirectory(previous.name)) {
          // If the directory itself is being renamed,
          // Phase I: Ignore it, and get the files moved
          // Phase II: Keep track of these, and delete them after
          //           all the files moved.
          // directoriesToDelete.push(previous.name)
          directoriesToDelete.push(previous.name);
        } else {
          const newDir = path.dirname(current.name);

          // Check if the new directory exists, if not, create it
          if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
          }

          // Move the file to the new directory
          fs.renameSync(previous.name, current.name);
        }
      }
    }

    // handle deleting files and directories.
    if (previous && !current) {
      let stats = fs.statSync(previous.name);
      //Check if the file path we are trying to delete is a directory
      if (!stats.isDirectory()) {
        fs.unlinkSync(previous.name);
      } else {
        //Performs directory deletion.
        fs.rm(
          previous.name,
          {
            recursive: true, //Makes sure that all files in directory are deleted.
          },
          (error) => {
            if (error) {
              console.log(error);
            }
          },
        );
      }
    }

    // Handle creating files and Directories.
    if (!previous && current) {
      //File Creation
      if (!isDirectory(current.name)) {
        if (isImageFile(current.name)) {
          // Write image files as binary from base64
          const buffer = Buffer.from(
            current.text,
            'base64',
          );
          fs.writeFileSync(current.name, buffer);
        } else {
          // Write non-image files as text
          fs.writeFileSync(current.name, current.text);
        }
      } else {
        fs.mkdirSync(current.name, { recursive: true });
      }
    }
  }
  // TODO deleted all directories under directoriesToDelete

  for (const dir of directoriesToDelete) {
    //Performs directory deletion.
    fs.rm(
      dir,
      {
        recursive: true, //Makes sure that all files in directory are deleted.
      },
      (error) => {
        if (error) {
          console.log(error);
        }
      },
    );
  }

  previousDocument = currentDocument;
};

// // Listen for when users modify files.
// // Files get written to disk after `autoSaveDebounceTimeMS`
// // milliseconds of inactivity.
// let timeout;
// shareDBDoc.subscribe(() => {
//   shareDBDoc.on('op', () => {
//     // console.log(shareDBDoc.data.isInteracting);
//     clearTimeout(timeout);
//     timeout = setTimeout(save, autoSaveDebounceTimeMS);
//   });
// });

let lastExecutedTime = Date.now();
let lastChangeTimeout; // This timeout ensures the last change is saved

// Function to throttle the saving
function throttleSave() {
  const now = Date.now();
  const timeSinceLastExecution = now - lastExecutedTime;

  if (timeSinceLastExecution > throttleTimeMS) {
    save();
    lastExecutedTime = now;
  } else {
    // Clear the previous timeout and set a new one to save the last change
    clearTimeout(lastChangeTimeout);
    lastChangeTimeout = setTimeout(() => {
      save();
      lastExecutedTime = now;
    }, throttleTimeMS - timeSinceLastExecution);
  }
}

// Function to debounce the saving
let debounceTimeout;
function debounceSave() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(
    save,
    autoSaveDebounceTimeMS,
  );
}

// Subscribe to listen for modifications
shareDBDoc.subscribe(() => {
  shareDBDoc.on('op', () => {
    if (shareDBDoc.data.isInteracting) {
      throttleSave();
    } else {
      debounceSave();
    }
  });
});

server.listen(port, async () => {
  // Note: ngrok support can be added when the package is properly installed
  // Sets the port to the one specified in the environment
  // variable (for development) or the default port.
  let livePort = process.env.EDITOR_PORT || port;
  console.log(`EDITOR_PORT: ${process.env.EDITOR_PORT}`);
  console.log(
    `Editor is live at http://localhost:${livePort}`,
  );
  open(`http://localhost:${livePort}`);
});
