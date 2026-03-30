import type { RouteRecordRaw } from 'vue-router';

import { mapTree } from '@vben-core/shared/utils';

/**
 * 为所有叶子页面路由默认开启 keepAlive（与 Vben 标签栏 KeepAlive 一致）。
 * 跳过：无 component、含子路由的父级、Root 布局占位、显式 meta.keepAlive === false。
 */
export function applyDefaultKeepAlive(
  routes: RouteRecordRaw[],
): RouteRecordRaw[] {
  return mapTree(routes, (route) => {
    const childList = route.children;
    const hasChildren = Array.isArray(childList) && childList.length > 0;
    const hasComponent = Boolean(route.component);

    if (
      !hasComponent ||
      hasChildren ||
      route.name === 'Root' ||
      route.meta?.keepAlive === false
    ) {
      return route;
    }

    return {
      ...route,
      meta: { ...route.meta, keepAlive: true },
    };
  });
}
