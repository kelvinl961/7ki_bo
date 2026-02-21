import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ic:baseline-photo-library',
      order: 700,
      title: '媒体库管理',
    },
    name: 'MediaLibrary',
    path: '/media-library',
    children: [
      {
        name: 'MediaLibraryIndex',
        path: '',
        //@ts-ignore
        component: () => import('#/views/media-library/index.vue'),
        meta: {
          title: '媒体库',
          icon: 'ic:baseline-photo-library',
          keepAlive: true,
          authority: ['SUPER_ADMIN', 'ADMIN'], // Allow both SUPER_ADMIN and ADMIN
        },
      },
    ],
  },
];

export default routes;
