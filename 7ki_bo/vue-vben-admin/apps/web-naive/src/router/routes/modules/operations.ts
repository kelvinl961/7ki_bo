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
          title: '客服管理',
        },
        name: 'CustomerService',
        path: '/operations/customer-service',
        //@ts-ignore
        component: () => import('../../../views/operations/CustomerService.vue'),
      },
      {
        meta: {
          title: '有奖反馈',
        },
        name: 'FeedbackManagement',
        path: '/operations/feedback-management',
        //@ts-ignore
        component: () => import('../../../views/operations/FeedbackManagement.vue'),
      },
    ],
  },
];

export default routes;



