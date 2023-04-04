#!/usr/bin/env node
import http from 'http';
import express from 'express';
import ShareDB from 'sharedb';
import { WebSocketServer } from 'ws';
import WebSocketJSONStream from '@teamwork/websocket-json-stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { json1Presence } from './src/ot.js';
import { randomId } from './src/randomId.js';
import open from 'open';
import ngrok from 'ngrok';
import dotenv from 'dotenv';

// The time in milliseconds by which auto-saving is debounced.
const autoSaveDebounceTimeMS = 800;

// Server port.
const port = 3030;

// Use the current working directory to look for files.
const fullPath = process.cwd();
dotenv.config({ path: '../.env' });

// Isolate files, not directories.
// Inspired by https://stackoverflow.com/questions/41472161/fs-readdir-ignore-directories
const files = fs
  .readdirSync(fullPath, { withFileTypes: true })
  .filter((dirent) => dirent.isFile())
  .map((dirent) => dirent.name);

// Initialize the document using our data structure for representing files.
//  * Keys are file ids, which are random numbers.
//  * Values are objects with properties:
//    * text - the text content of the file
//    * name - the file name
const initialDocument = {};
files.forEach((file) => {
  const id = randomId();
  initialDocument[id] = {
    text: fs.readFileSync(file, 'utf-8'),
    name: file,
  };
});

// Register our custom OT type,
// because it does not ship with ShareDB.
ShareDB.types.register(json1Presence.type);

const app = express();

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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, '/dist');
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
  const currentDocument = shareDBDoc.data;

  // Take a look at each file (key) previously and currently.
  const allKeys = Object.keys({ ...currentDocument, ...previousDocument });
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

// Listen for when users modify files.
// Files get written to disk after `autoSaveDebounceTimeMS`
// milliseconds of inactivity.
let timeout;
shareDBDoc.subscribe(() => {
  shareDBDoc.on('op', (op) => {
    clearTimeout(timeout);
    timeout = setTimeout(save, autoSaveDebounceTimeMS);
  });
});

let oldName = '';
fs.watch(fullPath, function (event, filename) {
  if (event == 'rename') {
    if (oldName == '') {
      oldName = filename;
    } else {
      const currentDocument = shareDBDoc.data;
      const allKeys = Object.keys(currentDocument);
      for (const key of allKeys) {
        const current = currentDocument[key];
        if (current.name == oldName) {
          current.name = filename;
          shareDBDoc.submitOp([{ p: [key], oi: filename }]);
          oldName = '';
          break;
        }
      }
    }
  }
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
