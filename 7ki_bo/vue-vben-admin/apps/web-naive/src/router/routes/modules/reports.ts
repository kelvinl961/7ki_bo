import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-bar-chart',
      keepAlive: true,
      order: 400,
      title: '报表',
    },
    name: 'Reports',
    path: '/reports',
    children: [
      {
        meta: {
          title: '运营统计',
        },
        name: 'OperationsStatistics',
        path: '/reports/operations-statistics',
        component: () => import('../../../views/reports/OperationsStatistics.vue'),
      },
    ],
  },
];

export default routes;
