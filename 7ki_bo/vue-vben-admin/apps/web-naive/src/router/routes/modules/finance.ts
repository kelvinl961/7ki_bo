import type { RouteRecordRaw } from 'vue-router';

// ✅ PERFORMANCE: Eager load frequently used Order List page
import RechargeOrderList from '#/views/finance/RechargeOrderList.vue';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-account-balance-wallet',
      keepAlive: true,
      order: 350,
      title: 'page.menu.financeManagement',
    },
    name: 'FinanceManagement',
    path: '/finance',
    children: [
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.rechargeManagement',
        },
        name: 'RechargeManagement',
        path: '/finance/recharge-management',
        component: () => import('#/views/finance/RechargeManagement.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.onlineRecharge',
        },
        name: 'OnlineRecharge',
        path: '/finance/online-recharge',
        component: RechargeOrderList, // Static import - no loading delay
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.withdrawManagement',
        },
        name: 'WithdrawManagement',
        path: '/finance/withdraw-management',
        component: () => import('#/views/finance/WithdrawManagement.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.wageringAudit',
        },
        name: 'WageringAudit',
        path: '/finance/wagering-audit',
        component: () => import('#/views/finance/WageringAudit.vue'),
      },
    ],
  },
];

export default routes;
