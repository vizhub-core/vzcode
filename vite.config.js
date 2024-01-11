import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const APP_PORT = 3030;

/** @returns {import('vite').Plugin} */
const startServerPlugin = () => {
  let start = true;
  return {
    name: 'start-vzcode-server',
    async configureServer({ config: { logger, mode } }) {
      if (mode !== 'fullstack' || !start) {
        return;
      }
      const { createServer } = await import(
        './src/server/app.js'
      );
      logger.info('start vzcode server');
      const server = createServer();
      await new Promise((resolve) =>
        server.listen(APP_PORT, resolve),
      );
      start = false;
      logger.info('vzcode server started');
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), startServerPlugin()],
  server: {
    proxy: {
      '/ws': {
        target: 'ws://localhost:' + APP_PORT,
        ws: true,
      },
    },
  },

  // Required to have Vite properly handle these CommonJS imports
  optimizeDeps: {
    include: [
      'sharedb-client-browser/dist/sharedb-client-umd.cjs',
      'sharedb-client-browser/dist/ot-json1-presence-umd.cjs',
    ],
  },
});
