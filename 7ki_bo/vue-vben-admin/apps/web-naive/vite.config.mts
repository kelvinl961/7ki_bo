import { defineConfig } from '@vben/vite-config';
import type { ConfigEnv } from 'vite';
import { loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(async (config?: ConfigEnv) => {
  const isBuild = config?.command === 'build';
  const mode = config?.mode ?? 'development';
  const env = loadEnv(mode, process.cwd(), '');
  // 开发：.env.development 的 VITE_DEV_API_PROXY_TARGET（如 https://277br.pangu6688.com）
  const apiTarget =
    env.VITE_DEV_API_PROXY_TARGET?.trim() || 'http://localhost:5000';
    
  return {
    application: {
      nitroMock: false,
    },
    vite: {
      build: {
        chunkSizeWarningLimit: 2000,
        reportCompressedSize: false, 
        rollupOptions: {
          output: {
            // Keep vendor chunks merged to avoid HTTP queueing; let Vite
            // split views by dynamic import so login does not download all pages.
            manualChunks(id: string) {
              if (id.includes('node_modules')) {
                if (
                  id.includes('ant-design-vue') ||
                  id.includes('@ant-design') ||
                  id.includes('naive-ui') ||
                  id.includes('@vicons')
                ) {
                  return 'vendor-ui';
                }
                return 'vendor-libs';
              }
              // Group view modules by top-level feature folder (smaller than
              // one pages-combined blob, still fewer requests than per-file).
              const viewsMatch = id.match(/[\\/]src[\\/]views[\\/]([^\\/]+)/);
              if (viewsMatch?.[1]) {
                const folder = viewsMatch[1];
                if (folder === '_core') return 'pages-core';
                return `pages-${folder}`;
              }
              if (
                id.includes('src/api/') ||
                id.includes('src/utils/') ||
                id.includes('src/store/')
              ) {
                return 'core-logic';
              }
            },
          },
        },
      },
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
            // 延长超时时间，防止大数据接口断开
            timeout: 60000,
            proxyTimeout: 60000,
            secure: false,
          },
        },
      },
      esbuild: {
        // 生产环境自动剔除所有 log，减少包体积和运行负担
        drop: isBuild ? ['console', 'debugger'] : ['debugger'],
        legalComments: 'none',
      },
    },
  };
});