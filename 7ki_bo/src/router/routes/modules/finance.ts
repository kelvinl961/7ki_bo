import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-account-balance-wallet',
      keepAlive: true,
      order: 350,
      title: '财务管理',
    },
    name: 'FinanceManagement',
    path: '/finance',
    children: [
      {
        meta: {
          title: '充值管理',
        },
        name: 'RechargeManagement',
        path: '/finance/recharge-management',
        component: () => import('#/views/finance/RechargeManagement.vue'),
      },
      {
        meta: {
          title: '在线充值',
        },
        name: 'OnlineRecharge',
        path: '/finance/online-recharge',
        component: () => import('#/views/finance/RechargeOrderList.vue'),
      },
      {
        meta: {
          title: '提现管理',
        },
        name: 'WithdrawManagement',
        path: '/finance/withdraw-management',
        component: () => import('#/views/finance/WithdrawManagement.vue'),
      },
      {
        meta: {
          title: '投注任务(稽核)',
        },
        name: 'WageringAudit',
        path: '/finance/wagering-audit',
        component: () => import('#/views/finance/WageringAudit.vue'),
      },
    ],
  },
];

export default routes; 