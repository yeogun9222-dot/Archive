import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // 환경변수 로드 순서: .env.stage > .env.local > default
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
      port: 5174,
      host: '0.0.0.0',
      proxy: {
        // 모든 환경에서 프록시 사용 (User Frontend와 동일)
        '/api': {
          target: env.VITE_ADMIN_API_BASE_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        }
      },
      // Enable HMR for development
      hmr: {
        port: 5174,
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