import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: 'index.html', // Ensure Vite knows your entry file
    },
    outDir: 'dist', // Output directory for the build
  },
  server: {
    port: 3000, // You can change this if needed
    open: true, // Opens the browser automatically
  }
});
