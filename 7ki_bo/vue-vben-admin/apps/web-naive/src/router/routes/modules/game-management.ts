import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:gamepad-2',
      order: 5,
      title: '游戏管理',
    },
    name: 'GameManagement',
    path: '/game-management',
    children: [
      {
        name: 'GameManagementMain',
        path: '', // @ts-ignore
        component: () => import('#/views/game-management/index.vue'),
        meta: {
          keepAlive: true,
          title: '游戏平台管理',
          fullPathKey: false, // Use path as key instead of fullPath to prevent duplicates
        },
      },
      {
        name: 'BetRecords',
        path: 'bet-records', // @ts-ignore
        component: () =>
          import('#/views/game-management/bet-records/index.vue'),
        meta: {
          keepAlive: true,
          title: '投注记录',
        },
      },
      {
        name: 'GameStatistics',
        path: 'game-statistics', // @ts-ignore
        component: () =>
          import('#/views/game-management/game-statistics/index.vue'),
        meta: {
          keepAlive: true,
          title: '游戏统计',
        },
      },
    ],
  },
];

export default routes;
