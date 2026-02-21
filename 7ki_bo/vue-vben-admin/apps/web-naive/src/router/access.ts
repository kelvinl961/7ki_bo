import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
} from '@vben/types';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';

import { message } from '#/adapter/naive';
import { getAllMenusApi } from '#/api';
import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';
// @ts-ignore
const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

// ✅ PERFORMANCE FIX: Cache menu data to avoid re-fetching on every navigation
let cachedMenuData: any = null;
let menuCacheTimestamp: number = 0;
const MENU_CACHE_DURATION = 5 * 60 * 1000; // Cache for 5 minutes

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  };

  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    fetchMenuListAsync: async () => {
      // ✅ PERFORMANCE FIX: Use cached menu data if available and not expired
      const now = Date.now();
      if (cachedMenuData && now - menuCacheTimestamp < MENU_CACHE_DURATION) {
        console.log('⚡ Using cached menu data');
        return cachedMenuData;
      }

      // Show loading message only if not using cache
      message.loading(`${$t('common.loadingMenu')}...`, {
        duration: 1.5,
      });

      try {
        const menuData = await getAllMenusApi();
        // Cache the menu data
        cachedMenuData = menuData;
        menuCacheTimestamp = now;
        console.log('✅ Menu data fetched and cached');
        return menuData;
      } catch (error) {
        console.error('❌ Failed to fetch menu data:', error);
        // Return cached data even if expired as fallback
        if (cachedMenuData) {
          console.warn('⚠️ Using expired cache as fallback');
          return cachedMenuData;
        }
        throw error;
      }
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });
}

export { generateAccess };
