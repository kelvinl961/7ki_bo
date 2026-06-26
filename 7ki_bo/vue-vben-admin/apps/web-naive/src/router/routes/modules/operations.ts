import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-support-agent',
      keepAlive: true,
      order: 750,
      title: 'page.menu.operations',
    },
    name: 'Operations',
    path: '/operations',
    children: [
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.customerService',
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
          title: 'page.menu.feedbackManagement',
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
          title: 'page.menu.thirdPartyTracking',
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
          title: 'page.menu.appPackageManagement',
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
