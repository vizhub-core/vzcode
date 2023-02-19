import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [commonjs(), nodePolyfills(), nodeResolve(), react()],
  server: {
    proxy: {
      '/': {
        target: 'ws://localhost:3030',
        ws: true,
      },
    },
  },
});
