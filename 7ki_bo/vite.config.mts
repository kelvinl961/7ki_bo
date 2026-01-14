import { defineConfig } from '@vben/vite-config';
import type { ConfigEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(async (config?: ConfigEnv) => {
  // Always use local backend for development
  const apiTarget = 'http://localhost:5000';
  const isBuild = config?.command === 'build';
    
  return {
    application: {
      // Disable Nitro mock service - use real backend
      nitroMock: false,
    },
    vite: {
      resolve: {
        alias: {
          '#': resolve(__dirname, 'src'),
        },
      },
      server: {
        port: 5888,
        proxy: {
          '/api': {
            changeOrigin: true,
            target: apiTarget,
            ws: true,
            timeout: 0,
            proxyTimeout: 0,
            secure: false,
          },
          '/uploads': {
            changeOrigin: true,
            target: apiTarget,
            ws: false,
            secure: false,
          },
        },
      },
      esbuild: {
        // ✅ Remove ALL console statements in production builds (including console.error)
        // This removes 1865+ console statements across 165 files automatically
        // In development, keep all console statements for debugging
        drop: isBuild ? ['console', 'debugger'] : ['debugger'],
        legalComments: 'none',
      },
    },
  };
});
