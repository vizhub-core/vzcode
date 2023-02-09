#!/usr/bin/env node
import http from 'http';
import express from 'express';
import ShareDB from 'sharedb';
import json1 from 'ot-json1';
import { WebSocketServer } from 'ws';
import WebSocketJSONStream from '@teamwork/websocket-json-stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const fullPath = process.cwd();
console.log(fullPath);

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

//console.log(initialDocument);


ShareDB.types.register(json1.type);

const app = express();
const port = 5173;

const shareDBBackend = new ShareDB();
const shareDBConnection = shareDBBackend.connect();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  shareDBBackend.listen(new WebSocketJSONStream(ws));
});

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, '/dist');

app.use(express.static(dir));

// Create initial document
// TODO
//  * figure out how to list files on disk with NodeJS
//  * use that list to populate the files in our document.
const shareDBDoc = shareDBConnection.get('documents', '1');
shareDBDoc.create(initialDocument, json1.type.uri);

server.listen(port, () => {
  console.log(`Editor is live at http://localhost:${port}`);
});
