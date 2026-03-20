import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-science',
      keepAlive: true,
      order: 999,
      title: '功能演示',
    },
    name: 'Demo',
    path: '/demo',
    children: [
      {
        meta: {
          title: '商户RTP调控',
        },
        name: 'MerchantRtpControl',
        path: '/demo/merchant-rtp-control',
        component: () => import('../../../views/demo/MerchantRtpControl.vue'),
      },
      {
        meta: {
          title: '条件RTP配置（演示）',
        },
        name: 'ConditionalRtpRuleBuilderDemo',
        path: '/demo/conditional-rtp-config',
        component: () =>
          import(
            '../../../views/demo/ConditionalRtpRuleBuilderDemo.vue'
          ),
      },
    ],
  },
];

export default routes;
