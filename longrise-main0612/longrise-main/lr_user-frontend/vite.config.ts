import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const stageEnvExists = fs.existsSync('.env.stage');
  const effectiveMode = stageEnvExists ? 'stage' : mode;
  const env = loadEnv(effectiveMode, '.', '');

  return {
    plugins: [react(), tailwindcss()],
    define: {
      // Expose Vite environment variables
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@services': path.resolve(__dirname, './src/services'),
        '@types': path.resolve(__dirname, './src/types'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils'),
      },
    },
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: {
        // Proxy API calls to FastAPI backend during development
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        }
      },
      // Enable HMR for development
      hmr: {
        port: 5173,
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['motion', 'lucide-react'],
            api: ['axios'],
          }
        }
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'axios', 'motion']
    }
  };
});
