import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Temporary for JSON1presence import
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),viteCommonjs()],
  server: {
    proxy: {
      '/ws': {
        target: 'ws://localhost:3030',
        ws: true,
      },
    },
  },
});
