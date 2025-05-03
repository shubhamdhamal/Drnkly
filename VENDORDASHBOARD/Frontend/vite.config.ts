import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['jspdf'],
    exclude: ['html2canvas', 'core-js', 'canvg'],
  },
  build: {
    rollupOptions: {
      external: ['html2canvas', 'core-js', 'jspdf', 'canvg'],
    },
  },
});
