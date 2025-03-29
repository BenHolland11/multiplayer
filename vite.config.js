import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: 'index.html', // Ensure Vite knows your entry file
    },
    outDir: 'dist', // Output directory for the build
  },
  server: {
    host: '0.0.0.0', // Ensures it works on Railway
    port: process.env.PORT || 3000, // You can change this if needed
    open: false, // Opens the browser automatically
    allowedHosts: ['.railway.app'] // Allow Railway subdomains
  }
});
