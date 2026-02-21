import { defineConfig } from '@vben/vite-config';
import type { ConfigEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(async (config?: ConfigEnv) => {
  const isBuild = config?.command === 'build';
  // 开发环境下使用本地后端，生产环境下使用相对路径 /api 禁用 Preflight
  const apiTarget = 'http://localhost:5000';
    
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
            // ✅ 核心优化：解决文件碎片导致的 18s 排队问题
            manualChunks(id: string) {
              if (id.includes('node_modules')) {
                // 将核心 UI 库合并，减少请求数
                if (id.includes('ant-design-vue') || id.includes('@ant-design') || 
                    id.includes('naive-ui') || id.includes('@vicons')) {
                  return 'vendor-ui';
                }
                // 将其他稳定的第三方库打包在一起
                return 'vendor-libs';
              }
              // ✅ 关键：将所有业务视图合并为一个大 Chunk
              // 这样浏览器只需下载一个文件，而不是 50 个 1KB 的小文件，彻底解决 Queueing
              if (id.includes('src/views/')) {
                return 'pages-combined';
              }
              // 合并工具函数和核心逻辑
              if (id.includes('src/api/') || id.includes('src/utils/') || id.includes('src/store/')) {
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