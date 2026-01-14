import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:home',
      order: -1,
      title: 'page.dashboard.home',
    },
    name: 'Home',
    path: '/home',
    component: () => import('#/views/dashboard/analytics/index.vue'),
  },
];

export default routes;
