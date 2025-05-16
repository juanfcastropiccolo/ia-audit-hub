import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Permite la construcción incluso con advertencias de TypeScript
    emptyOutDir: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1600,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
})
