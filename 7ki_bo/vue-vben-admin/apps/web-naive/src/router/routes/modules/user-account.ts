import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-manage-accounts',
      keepAlive: true,
      order: 900,
      title: 'page.menu.userAccount',
    },
    name: 'UserAccount',
    path: '/user-account',
    children: [
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.backofficeAccounts',
        },
        name: 'BackofficeAccounts',
        path: '/user-account/backoffice-accounts',
        component: () =>
          import('#/views/user-account/backoffice-accounts/index.vue'),
      },
    ],
  },
];

export default routes;
