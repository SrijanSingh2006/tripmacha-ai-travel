import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Locks the dev server to port 5173 so your FastAPI backend always knows where to send data
    port: 5173, 
    strictPort: true,
  }
});