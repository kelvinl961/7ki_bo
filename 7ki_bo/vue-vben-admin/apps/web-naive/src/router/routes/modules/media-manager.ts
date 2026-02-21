import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ic:baseline-photo-library',
      order: 701,
      title: '媒体文件管理',
    },
    name: 'MediaManager',
    path: '/media-manager',
    children: [
      {
        name: 'MediaManagerIndex',
        path: '',
        // @ts-ignore
        component: () =>
          import('#/views/media-manager/index.vue').catch((error) => {
            console.error('❌ Failed to load media-manager component:', error);
            throw error;
          }),
        meta: {
          title: '媒体文件',
          icon: 'ic:baseline-photo-library',
          keepAlive: true,
          authority: ['SUPER_ADMIN', 'ADMIN'],
        },
      },
    ],
  },
];

export default routes;
