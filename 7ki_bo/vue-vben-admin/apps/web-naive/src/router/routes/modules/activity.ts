import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:outline-campaign',
      keepAlive: true,
      order: 400,
      title: 'page.menu.promotionalActivities',
    },
    name: 'PreferentialActivities',
    path: '/preferentialActivitiesNew',
    children: [
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.activityCenter',
          fullPathKey: false, // 子 tab 切换不新开标签页
        },
        name: 'ActivityCenter',
        path: '/preferentialActivitiesNew/activityCenter',
        // @ts-ignore
        component: () => import('#/views/activity/ActivityCenter.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.taskCenter',
          fullPathKey: false, // 子 tab 切换不新开标签页
        },
        name: 'TaskCenter',
        path: '/preferentialActivitiesNew/taskCenter',
        // @ts-ignore
        component: () => import('#/views/activity/TaskCenter.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.userActivities',
        },
        name: 'UserActivityDashboard',
        path: '/preferentialActivitiesNew/user-activities',
        // @ts-ignore
        component: () => import('#/views/user/ActivityDashboard.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.activityRewardReport',
        },
        name: 'ActivityRewardReport',
        path: '/preferentialActivitiesNew/activity-reward-report',
        // @ts-ignore
        component: () => import('#/views/activity/ActivityRewardReport.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.providentFund',
        },
        name: 'ProvidentFund',
        path: '/preferentialActivitiesNew/provident-fund',
        // @ts-ignore
        component: () => import('#/views/activity/ProvidentFund.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.playerRebate',
        },
        name: 'PlayerRebate',
        path: '/preferentialActivitiesNew/player-rebate',
        // @ts-ignore
        component: () => import('#/views/activity/PlayerRebate.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.interestTreasure',
        },
        name: 'InterestTreasure',
        path: '/preferentialActivitiesNew/interest-treasure',
        // @ts-ignore
        component: () => import('#/views/activity/InterestTreasure.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.luckyWheel',
        },
        name: 'LuckyWheel',
        path: '/preferentialActivitiesNew/lucky-wheel',
        // @ts-ignore
        component: () => import('#/views/activity/LuckyWheel.vue'),
      },
      {
        meta: {
          icon: 'ic:outline-emoji-events',
          title: 'page.menu.vipReward',
        },
        name: 'VIPReward',
        path: '/preferentialActivitiesNew/vip-reward',
        children: [
          {
            meta: {
              keepAlive: true,
              title: 'page.menu.vipRewardSetting',
            },
            name: 'VIPRewardSetting',
            path: '/preferentialActivitiesNew/vip-reward/setting',
            // @ts-ignore
            component: () => import('#/views/vip/VIPRewardSetting.vue'),
          },
          {
            meta: {
              keepAlive: true,
              title: 'page.menu.vipRewardOverview',
            },
            name: 'VIPRewardOverview',
            path: '/preferentialActivitiesNew/vip-reward/overview',
            // @ts-ignore
            component: () => import('#/views/vip/VIPRewardOverview.vue'),
          },
        ],
      },
    ],
  },
];

export default routes;
