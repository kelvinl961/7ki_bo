import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:outline-branding-watermark',
      keepAlive: true,
      order: 500,
      title: 'page.menu.brandManagement',
    },
    name: 'OperateManager',
    path: '/operateManager',
    children: [
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.brandLogoSetting',
          fullPathKey: false, // 子 tab 切换不新开标签页，与游戏管理一致
        },
        name: 'BrandLogoSetting',
        path: '/operateManager/brandLogoSetting',
        // @ts-ignore
        component: () => import('../../../views/brand/BrandLogoSetting.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.brandSkinSetting',
        },
        name: 'BrandSkinSetting',
        path: '/operateManager/brandSkinSetting',
        // @ts-ignore
        component: () => import('../../../views/brand/BrandSkinSetting.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.domainManagement',
        },
        name: 'DomainManagement',
        path: '/operateManager/domainManagement',
        // @ts-ignore
        component: () =>
          import('../../../views/operateManager/domainManagement/index.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.messageSettings',
        },
        name: 'SystemMessageSet',
        path: '/operateManager/systemMessageSet',
        // @ts-ignore
        component: () =>
          import('../../../views/operateManager/OperationMessageTZ.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.layoutDesign',
        },
        name: 'LayoutDesign',
        path: '/operateManager/layoutDesign',
        // @ts-ignore
        component: () =>
          import('../../../views/operateManager/LayoutDesign.vue'),
      },
    ],
  },
];

export default routes;
