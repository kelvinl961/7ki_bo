import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-support-agent',
      keepAlive: true,
      order: 750,
      title: '运营',
    },
    name: 'Operations',
    path: '/operations',
    children: [
      {
        meta: {
          keepAlive: true,
          title: '客服管理',
        },
        name: 'CustomerService',
        path: '/operations/customer-service',
        // @ts-ignore
        component: () =>
          import('../../../views/operations/CustomerService.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: '有奖反馈',
        },
        name: 'FeedbackManagement',
        path: '/operations/feedback-management',
        // @ts-ignore
        component: () =>
          import('../../../views/operations/FeedbackManagement.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: '三方埋点',
        },
        name: 'ThirdPartyTracking',
        path: '/operations/third-party-tracking',
        // @ts-ignore
        component: () =>
          import('../../../views/operateManager/ThirdPartyTracking.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'APP包管理',
        },
        name: 'AppPackageManagement',
        path: '/operations/app-package-management',
        // @ts-ignore
        component: () =>
          import('../../../views/operations/AppPackageManagement.vue'),
      },
    ],
  },
];

export default routes;
