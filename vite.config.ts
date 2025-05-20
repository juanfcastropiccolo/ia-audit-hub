import { defineConfig, type ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { componentTagger } from 'lovable-tagger';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => ({
  plugins: [
    // Use default settings for React plugin (esbuild for TS, Babel for JSX)
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '::',
    port: 8080,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Skip type checking during build
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      onwarn(warning, warn) {
        // Skip various warnings
        if (
          warning.code === 'CIRCULAR_DEPENDENCY' ||
          warning.code === 'THIS_IS_UNDEFINED' ||
          (warning.code === 'PLUGIN_WARNING' && 
            warning.message.includes('TS6305') || 
            warning.message.includes('TS6306') ||
            warning.message.includes('TS6310') || 
            warning.message.includes('TS6377'))
        ) {
          return;
        }
        warn(warning);
      }
    }
  },
  // Use local TypeScript configuration
  optimizeDeps: {
    esbuildOptions: {
      tsconfig: 'tsconfig.local.json'
    },
    exclude: [
      '@supabase/supabase-js',
      'socket.io-client',
      'lucide-react',
      'lovable-tagger'
    ]
  },
  // Add environment variables for development mode
  define: {
    'process.env.SKIP_TYPESCRIPT_CHECK': mode === 'development' ? true : false,
    'process.env.VITE_API_URL': JSON.stringify('http://localhost:8001')
  }
}));
