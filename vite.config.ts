import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
      // HMR configuration
      hmr: process.env.DISABLE_HMR !== 'true',
      // Ignore backend JSON database writes to prevent endless HMR page reloads
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/server/data/**', '**/server/data/db.json'],
      },
    },
  };
});
