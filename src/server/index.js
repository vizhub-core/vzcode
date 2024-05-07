#!/usr/bin/env node
import './setupEnv.js';
import http from 'http';
import express from 'express';
import ShareDB from 'sharedb';
import { WebSocketServer } from 'ws';
import WebSocketJSONStream from '@teamwork/websocket-json-stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
//import open from 'open'; // seem is hard to use 
import { openBrowser } from './utils.js';

import ngrok from 'ngrok';
import bodyParser from 'body-parser';
import { json1Presence } from '../ot.js';
import { computeInitialDocument } from './computeInitialDocument.js';
import { handleAIAssist } from './handleAIAssist.js';
import { isDirectory } from './isDirectory.js';

import { myLogger,FileSys } from './utils.js';
import { myShareDB } from './myShareDB.js';
import { getPortFromArgs, getWebsiteSpaceFromArgs, getDocumentSpaceFromArgs } from "./cmdArg.js"


// The time in milliseconds by which auto-saving is debounced.
const autoSaveDebounceTimeMS = 800;

// The time in milliseconds by which auto-saving is throttled
// when the user is interacting with the widgets in the editor.
const throttleTimeMS = 100;

//------ Server port
const port = getPortFromArgs();
 
//------  Express website path   
const websitePath = getWebsiteSpaceFromArgs();
if (FileSys.isDir(websitePath,true)){

} 

//------  Document space path  
var docSpacePath = getDocumentSpaceFromArgs();
myLogger.debug(`document space path:${docSpacePath}`);
if (FileSys.isDir(docSpacePath,true)){

} 
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
// const filename = fileURLToPath(import.meta.url);
// const dirname = path.dirname(filename);
// const dir = path.join(dirname, '..', '..', 'dist');
// app.use(express.static(dir));
let dir = websitePath;
myLogger.debug(`express website root:${dir}`);
app.use(express.static(dir));

myShareDB.shareDBBackend = shareDBBackend;
myShareDB.openDoc(docSpacePath);
 

// Handle AI Assist requests.
app.post(
  '/ai-assist',
  bodyParser.json(),
 // handleAIAssist(shareDBDoc),
);
 

server.listen(port, async () => {
  if (process.env.NGROK_TOKEN) {
    (async function () {
      await ngrok.authtoken(process.env.NGROK_TOKEN);
      const url = await ngrok.connect(port);
      console.log(`Editor is live at ${url}`);
      openBrowser(url);
    })();
  } else {
    console.log(
      `🚀 Editor is live at http://localhost:${port}`,
    );
    openBrowser(`http://localhost:${port}`);
  }
});
