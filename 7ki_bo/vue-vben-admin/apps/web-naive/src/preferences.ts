import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    enableRefreshToken: true, // Enable automatic token refresh on 401
    loginExpiredMode: 'page', // 🔒 CHANGED: Use 'page' mode to prevent auto-logout - user must click logout
    enableCheckUpdates: true, // Enable version update checking
    checkUpdatesInterval: 30, // Check for updates every 30 minutes (reduced from 1 minute to avoid false positives)
  },
  /** 默认开启标签栏与页面 KeepAlive，切换标签保留列表筛选等状态 */
  tabbar: {
    enable: true,
    keepAlive: true,
  },
});
