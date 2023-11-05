#!/usr/bin/env node
import http from 'http';
import express from 'express';
import ShareDB from 'sharedb';
import { WebSocketServer } from 'ws';
import WebSocketJSONStream from '@teamwork/websocket-json-stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import open from 'open';
import ngrok from 'ngrok';
import dotenv from 'dotenv';
import { computeInitialDocument } from './computeInitialDocument.js';
import { json1Presence } from '../ot.js';
import bodyParser from 'body-parser';
import {
  generateAIResponse,
  handleAIAssist,
} from './handleAIAssist.js';
import { replaceOp } from 'ot-json1';

dotenv.config({ path: '../../.env' });

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

// TODO make this configurable
// See https://github.com/vizhub-core/vzcode/issues/95
app.post('/saveTime', (req, res) => {
  //autoSaveDebounceTimeMS = req.body.autoSaveDebounceTimeMS;
  console.log('autoSaveDebounceTimeMS', req.body);
});

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
  ws.on('close', (code) => {
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
shareDBDoc.create(initialDocument, json1Presence.type.uri);

// Handle AI Assist requests.
app.post(
  '/AIAssist',
  bodyParser.json(),
  handleAIAssist(shareDBDoc),
);

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
  for (const key of allKeys) {
    const previous = previousDocument.files[key];
    const current = currentDocument.files[key];

    // If this file was neither created nor deleted...
    if (previous && current) {
      // Handle changing of text content.
      if (previous.text !== current.text) {
        fs.writeFileSync(current.name, current.text);
      }

      // Handle renaming files.
      if (previous.name !== current.name) {
        fs.renameSync(previous.name, current.name);
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

    // Handle creating files.
    if (!previous && current) {
      fs.writeFileSync(current.name, current.text);
    }
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
  shareDBDoc.on('op', (op, source) => {
    if (
      op !== null &&
      op[0] == 'aiStreams' &&
      source != 'AIServer' &&
      source != 'AIAssist'
    ) {
      const input =
        op[op.length - 1]['i']['AIStreamStatus'];

      generateAIResponse({
        inputText: input.text,
        insertionCursor: input.insertionCursor,
        shareDBDoc: shareDBDoc,
        fileId: input.fileId,
      });

      const confirmStartOperation = replaceOp(
        [
          ...op.filter(
            (value) => typeof value === 'string',
          ),
          'AIStreamStatus',
          'serverIsRunning',
        ],
        true,
        true,
      );

      shareDBDoc.submitOp(confirmStartOperation, {
        source: 'AIServer',
      });
    }

    if (shareDBDoc.data.isInteracting) {
      throttleSave();
    } else {
      debounceSave();
    }
  });
});

server.listen(port, async () => {
  if (process.env.NGROK_TOKEN) {
    (async function () {
      await ngrok.authtoken(process.env.NGROK_TOKEN);
      const url = await ngrok.connect(port);
      console.log(`Editor is live at ${url}`);
      open(url);
    })();
  } else {
    console.log(
      `Editor is live at http://localhost:${port}`,
    );
    open(`http://localhost:${port}`);
  }
});
