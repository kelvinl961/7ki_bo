import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      hideInMenu: true,
      icon: 'mdi:shield-key-outline',
      order: 999,
      title: $t('page.auth.accountSecurity'),
    },
    name: 'Account',
    path: '/account',
    children: [
      {
        name: 'AccountSecurity',
        path: '/account/security',
        component: () => import('#/views/account/security.vue'),
        meta: {
          icon: 'mdi:shield-key-outline',
          title: $t('page.auth.accountSecurity'),
        },
      },
    ],
  },
];

export default routes;
