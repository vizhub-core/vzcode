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

dotenv.config({ path: '../../.env' });

// The time in milliseconds by which auto-saving is debounced.
const autoSaveDebounceTimeMS = 800;

// Server port.
const port = 3030;

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
  shareDBBackend.listen(new WebSocketJSONStream(ws));
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

// The state of the document when files were last auto-saved.
let previousDocument = initialDocument;

// Saves the files that changed.
const save = () => {
  // console.log('saving');
  const currentDocument = shareDBDoc.data;

  // Take a look at each file (key) previously and currently.
  const allKeys = Object.keys({
    ...currentDocument.files,
    ...previousDocument.files,
  });
  for (const key of allKeys) {
    const previous = previousDocument[key];
    const current = currentDocument[key];

    // If this file was neither created nor deleted...
    if (previous && current) {
      // Handle changing of text content.
      if (previous.text !== current.text) {
        fs.writeFileSync(current.name, current.text);
      }

      // Handle renaming files.
      if (previous.name !== current.name) {
        fs.renamesync(previous.name, current.name);
      }
    }

    // handle deleting files.
    if (previous && !current) {
      fs.unlinkSync(previous.name);
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

const throttleTimeMS = 200;

let lastExecutedTime = Date.now();

// Function to throttle the saving
function throttleSave() {
  const now = Date.now();
  if (now - lastExecutedTime > throttleTimeMS) {
    save();
    lastExecutedTime = now;
  }
}

// Function to debounce the saving
let debounceTimeout;
function debounceSave() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(save, autoSaveDebounceTimeMS);
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
  if (process.env.NGROK_TOKEN) {
    (async function () {
      await ngrok.authtoken(process.env.NGROK_TOKEN);
      const url = await ngrok.connect(port);
      console.log(`Editor is live at ${url}`);
      open(url);
    })();
  } else {
    console.log(`Editor is live at http://localhost:${port}`);
    open(`http://localhost:${port}`);
  }
});
