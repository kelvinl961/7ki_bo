import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-groups',
      keepAlive: true,
      order: 250,
      title: '代理管理',
    },
    name: 'AgentManagement',
    path: '/agency',
    children: [
      {
        meta: {
          title: '所有代理',
        },
        name: 'AllAgents',
        path: '/agency/agent-list',
        component: () => import('../../../views/agency/AgentList.vue'),
      },
      {
        meta: {
          title: '佣金管理',
        },
        name: 'CommissionManagement',
        path: '/agency/commission-management',
        component: () => import('../../../views/agency/CommissionManagement.vue'),
      },
      {
        meta: {
          title: '返水设置',
        },
        name: 'RebateSettings',
        path: '/agency/rebate-settings',
        component: () => import('../../../views/agency/AgencyRebateSettings.vue'),
      },
      {
        meta: {
          title: '代理模式',
        },
        name: 'AgentMode',
        path: '/agency/agent-mode',
        component: () => import('../../../views/agency/AgentMode.vue'),
      },
    ],
  },
];

export default routes; 