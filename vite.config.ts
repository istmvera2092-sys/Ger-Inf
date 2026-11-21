import { defineConfig } from 'vite';

const localServer = { host: '127.0.0.1', port: 4173, strictPort: true };

export default defineConfig({
  base: './',
  server: localServer,
  preview: localServer,
});
