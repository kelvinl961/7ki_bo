import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-store',
      keepAlive: true,
      order: 360,
      title: '商户管理',
    },
    name: 'Merchants',
    path: '/merchants',
    children: [
      {
        meta: {
          keepAlive: true,
          title: '商户列表',
        },
        name: 'MerchantsList',
        path: '/merchants/index',
        component: () => import('#/views/merchants/index.vue'),
      },
    ],
  },
];

export default routes;
