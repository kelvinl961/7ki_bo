import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-admin-panel-settings',
      order: 300,
      title: '账号管理',
    },
    name: 'UserAccount',
    path: '/user-account',
    children: [
      {
        name: 'BackofficeAccounts',
        path: '/user-account/backoffice-accounts',
        component: () => import('#/views/user-account/backoffice-accounts/index.vue'),
        meta: {
          icon: 'ic:baseline-account-circle',
          title: '后台账号',
        },
      },
    ],
  },
];

export default routes; 