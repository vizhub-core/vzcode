#!/usr/bin/env node
import http from 'http';
import express from 'express';
import ShareDB from 'sharedb';
import json1 from './src/json1presence/dist/index.js';
import { WebSocketServer } from 'ws';
import WebSocketJSONStream from '@teamwork/websocket-json-stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const fullPath = process.cwd();

// Isolate files, not directories.
// Inspired by https://stackoverflow.com/questions/41472161/fs-readdir-ignore-directories
const files = fs
  .readdirSync(fullPath, { withFileTypes: true })
  .filter((dirent) => dirent.isFile())
  .map((dirent) => dirent.name);

const initialDocument = {};
files.forEach((file) => {
  const id = Math.floor(Math.random() * 10000000000);
  initialDocument[id] = {
    text: fs.readFileSync(file, 'utf-8'),
    name: file,
  };
});

ShareDB.types.register(json1.type);

const app = express();
const port = 3030;

// Use ShareDB over WebSocket
const shareDBBackend = new ShareDB();
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
shareDBDoc.create(initialDocument, json1.type.uri);

// The time in milliseconds by which auto-saving is debounced.
const autoSaveDebounceTimeMS = 800;

// The state of the document when files were last auto-saved.
let previousDocument = initialDocument;

// Saves the files that changed.
const save = () => {
  const currentDocument = shareDBDoc.data;

  // Take a look at each file that we have currently.
  for (const key of Object.keys(currentDocument)) {
    // Handle changing of text content.
    if (previousDocument[key].text !== currentDocument[key].text) {
      const { name, text } = currentDocument[key];
      fs.writeFileSync(name, text);
    }

    // Handle renaming files.
    const oldPath = previousDocument[key].name;
    const newPath = currentDocument[key].name;
    if (oldPath !== newPath) {
      fs.renameSync(oldPath, newPath);
    }

    // TODO handle creating files
    // TODO handle deleting files
  }
  previousDocument = currentDocument;
};

// Listen for when users modify files.
let timeout;
shareDBDoc.subscribe(() => {
  shareDBDoc.on('op', (op) => {
    clearTimeout(timeout);
    timeout = setTimeout(save, autoSaveDebounceTimeMS);
  });
});

server.listen(port, () => {
  console.log(`Editor is live at http://localhost:${port}`);
});
