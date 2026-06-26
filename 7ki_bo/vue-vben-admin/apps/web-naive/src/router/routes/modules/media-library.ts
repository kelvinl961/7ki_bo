import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ic:baseline-photo-library',
      order: 700,
      title: 'page.menu.mediaLibraryManagement',
    },
    name: 'MediaLibrary',
    path: '/media-library',
    children: [
      {
        name: 'MediaLibraryIndex',
        path: '',
        // @ts-ignore
        component: () => import('#/views/media-library/index.vue'),
        meta: {
          title: 'page.menu.mediaLibrary',
          icon: 'ic:baseline-photo-library',
          keepAlive: true,
          authority: ['SUPER_ADMIN', 'ADMIN'], // Allow both SUPER_ADMIN and ADMIN
        },
      },
    ],
  },
];

export default routes;
