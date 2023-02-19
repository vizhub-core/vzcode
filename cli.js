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

const shareDBDoc = shareDBConnection.get('documents', '1');
shareDBDoc.create(initialDocument, json1.type.uri);

shareDBDoc.subscribe(() => {
  let data = [];
  shareDBDoc.on('op', (op) => {
    console.log(initialDocument[op[0]].text);
    console.log(op[2].es[0], op[2].es[1]);
    if (op[2].es[1] == ['\n']) {
      fs.writeFileSync(initialDocument[op[0]].name, data.join(''));
    }

    if (op[2].es[1] == undefined) {
      data[0] = op[2].es[0];
    } else {
      data[op[2].es[0]] = op[2].es[1];
    }
  });
});

server.listen(port, () => {
  console.log(`Editor is live at http://localhost:${port}`);
});
