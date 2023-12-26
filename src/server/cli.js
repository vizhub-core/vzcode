#!/usr/bin/env node

import open from 'open';
import ngrok from 'ngrok';
import { createServer } from './index.js';

// Helper function to get the port from command line arguments or use default.
function getPortFromArgs(defaultPort = 3030) {
  const portArg = process.argv.find((arg) =>
    /^--port=/.test(arg),
  );
  if (portArg) {
    return parseInt(portArg.split('=')[1], 10);
  }
  return defaultPort;
}

// Server port.
const port = getPortFromArgs();

const server = createServer({ serveStaticFiles: true });
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
