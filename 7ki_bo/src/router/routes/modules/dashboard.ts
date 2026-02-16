import type { RouteRecordRaw } from 'vue-router';
// ✅ PERFORMANCE: Eager load Dashboard - most frequently accessed page
import DashboardAnalytics from '#/views/dashboard/analytics/index.vue';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:home',
      order: -1,
      title: 'page.dashboard.home',
    },
    name: 'Home',
    path: '/home',
    component: DashboardAnalytics, // Static import - no loading delay
  },
];

export default routes;
