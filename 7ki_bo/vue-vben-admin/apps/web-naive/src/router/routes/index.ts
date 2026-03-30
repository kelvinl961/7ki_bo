import type { RouteRecordRaw } from 'vue-router';

import {
  applyDefaultKeepAlive,
  mergeRouteModules,
  traverseTreeValues,
} from '@vben/utils';

import { coreRoutes, fallbackNotFoundRoute } from './core';

// Note: eager: true is needed for mergeRouteModules to work correctly
// Route modules are small, so eager loading is acceptable
const dynamicRouteFiles = import.meta.glob('./modules/**/*.ts', {
  eager: true,
});

// 有需要可以自行打开注释，并创建文件夹
// const externalRouteFiles = import.meta.glob('./external/**/*.ts', { eager: true });
// const staticRouteFiles = import.meta.glob('./static/**/*.ts', { eager: true });

/** 动态路由模块合并结果（权限路由源） */
const dynamicRoutes: RouteRecordRaw[] = mergeRouteModules(dynamicRouteFiles);

/** 外部路由列表，访问这些页面可以不需要Layout，可能用于内嵌在别的系统(不会显示在菜单中) */
// const externalRoutes: RouteRecordRaw[] = mergeRouteModules(externalRouteFiles);
// const staticRoutes: RouteRecordRaw[] = mergeRouteModules(staticRouteFiles);
const staticRoutes: RouteRecordRaw[] = [];
const externalRoutes: RouteRecordRaw[] = [];

/** 路由列表，由基本路由、外部路由和404兜底路由组成
 *  无需走权限验证（会一直显示在菜单中） */
const routes: RouteRecordRaw[] = [
  ...applyDefaultKeepAlive(coreRoutes),
  ...externalRoutes,
  ...applyDefaultKeepAlive([fallbackNotFoundRoute]),
];

/** 基本路由列表，这些路由不需要进入权限拦截 */
const coreRouteNames = traverseTreeValues(coreRoutes, (route) => route.name);

/** 有权限校验的路由列表（叶子 keepAlive 在 generateAccessible 内统一注入） */
const accessRoutes = [...dynamicRoutes, ...staticRoutes];
export { accessRoutes, coreRouteNames, routes };
