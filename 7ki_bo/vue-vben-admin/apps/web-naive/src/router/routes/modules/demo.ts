import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-science',
      keepAlive: true,
      order: 999,
      title: 'page.menu.featureDemo',
    },
    name: 'Demo',
    path: '/demo',
    children: [
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.merchantRtpControl',
        },
        name: 'MerchantRtpControl',
        path: '/demo/merchant-rtp-control',
        component: () => import('../../../views/demo/MerchantRtpControl.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.conditionalRtpDemo',
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
