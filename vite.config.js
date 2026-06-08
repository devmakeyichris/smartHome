import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // On force Vite à tourner sur l'IP locale standard
    port: 5173,
    proxy: {
      '/users': {
        target: 'http://127.0.0.1:8080', // L'adresse du Spring Boot de ton binôme
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
});