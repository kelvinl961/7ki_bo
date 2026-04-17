import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-settings',
      keepAlive: true,
      order: 1000,
      title: '系统',
    },
    name: 'System',
    path: '/system',
    children: [
      {
        meta: {
          keepAlive: true,
          title: '站点管理',
        },
        name: 'SiteManagement',
        path: '/system/site-management',
        component: () =>
          import('#/views/site-management/site-bill/index.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: '站点账单详情',
          hideInMenu: true,
        },
        name: 'SiteBillDetail',
        path: '/system/site-management/bill/:billId',
        component: () =>
          import('#/views/site-management/site-bill/detail.vue'),
      },
    ],
  },
  /** 兼容旧路径书签（必须 hideInMenu，否则会在侧栏生成无标题占位 → 出现灰块空隙） */
  {
    path: '/site-management/site-bill',
    redirect: '/system/site-management',
    meta: { hideInMenu: true, title: '' },
  },
  {
    path: '/site-management/site-bill/:billId',
    redirect: (to) => ({
      path: `/system/site-management/bill/${to.params.billId as string}`,
    }),
    meta: { hideInMenu: true, title: '' },
  },
];

export default routes;
