import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-groups',
      keepAlive: true,
      order: 250,
      title: 'page.menu.agentManagement',
    },
    name: 'AgentManagement',
    path: '/agency',
    children: [
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.allAgents',
        },
        name: 'AllAgents',
        path: '/agency/agent-list',
        component: () => import('../../../views/agency/AgentList.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.commissionManagement',
        },
        name: 'CommissionManagement',
        path: '/agency/commission-management',
        component: () =>
          import('../../../views/agency/CommissionManagement.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.rebateSettings',
        },
        name: 'RebateSettings',
        path: '/agency/rebate-settings',
        component: () =>
          import('../../../views/agency/AgencyRebateSettings.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.agentMode',
        },
        name: 'AgentMode',
        path: '/agency/agent-mode',
        component: () => import('../../../views/agency/AgentMode.vue'),
      },
    ],
  },
];

export default routes;
