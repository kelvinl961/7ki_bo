import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-store',
      keepAlive: true,
      order: 360,
      title: 'page.menu.merchantManagement',
    },
    name: 'Merchants',
    path: '/merchants',
    children: [
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.merchantList',
        },
        name: 'MerchantsList',
        path: '/merchants/index',
        component: () => import('#/views/merchants/index.vue'),
      },
    ],
  },
];

export default routes;
