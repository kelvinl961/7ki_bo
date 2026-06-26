import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-bar-chart',
      keepAlive: true,
      order: 400,
      title: 'page.menu.reports',
    },
    name: 'Reports',
    path: '/reports',
    children: [
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.operationsStatistics',
        },
        name: 'OperationsStatistics',
        path: '/reports/operations-statistics',
        component: () =>
          import('../../../views/reports/OperationsStatistics.vue'),
      },
    ],
  },
];

export default routes;
