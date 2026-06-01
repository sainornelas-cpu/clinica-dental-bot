import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de Vite para React + Tailwind CSS
export default defineConfig({
  plugins: [react()],
  base: '/', // Para servir desde root en producción
  build: {
    // Cache-busting: agregar hash a los nombres de archivo
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    },
    // Asegurar que el build sea limpio
    emptyOutDir: true
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});