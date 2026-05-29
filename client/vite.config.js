import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de Vite para React + Tailwind CSS
export default defineConfig({
  plugins: [react()],
  base: '/', // Para servir desde root en producción
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