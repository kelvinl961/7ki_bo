import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:outline-branding-watermark',
      keepAlive: true,
      order: 500,
      title: '品牌管理',
    },
    name: 'OperateManager',
    path: '/operateManager',
    children: [
      {
        meta: {
          title: '品牌LOGO设置',
        },
        name: 'BrandLogoSetting',
        path: '/operateManager/brandLogoSetting',
        // @ts-ignore
        component: () => import('../../../views/brand/BrandLogoSetting.vue'),
      },
      {
        meta: {
          title: '品牌皮肤设置',
        },
        name: 'BrandSkinSetting',
        path: '/operateManager/brandSkinSetting',
        // @ts-ignore
        component: () => import('../../../views/brand/BrandSkinSetting.vue'),
      },
      {
        meta: {
          title: '域名管理',
        },
        name: 'DomainManagement',
        path: '/operateManager/domainManagement',
        // @ts-ignore
        component: () =>
          import('../../../views/operateManager/domainManagement/index.vue'),
      },
      {
        meta: {
          title: '消息设置',
        },
        name: 'SystemMessageSet',
        path: '/operateManager/systemMessageSet',
        // @ts-ignore
        component: () =>
          import('../../../views/operateManager/OperationMessageTZ.vue'),
      },
      {
        meta: {
          title: '个性化配置',
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
