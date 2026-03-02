import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Match the variable name used in index.tsx
      'process.env.OPEN_WEATHER_API_KEY': JSON.stringify(env.OPEN_WEATHER_API_KEY || '')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom']
    },
    build: {
      sourcemap: mode !== 'production',
      minify: mode === 'production',
      cssCodeSplit: false
    },
    server: {
      port: 3000,
      open: true
    }
  };
});