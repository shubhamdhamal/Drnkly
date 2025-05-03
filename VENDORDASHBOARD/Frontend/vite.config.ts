import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
   base: '/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['html2canvas', 'core-js', 'jspdf', 'canvg'],
  },
  build: {
    rollupOptions: {
      external: ['html2canvas', 'core-js', 'jspdf', 'canvg'],
    },
  },
});
