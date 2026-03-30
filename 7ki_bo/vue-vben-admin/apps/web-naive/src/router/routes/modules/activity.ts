import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:outline-campaign',
      keepAlive: true,
      order: 400,
      title: '优惠活动',
    },
    name: 'PreferentialActivities',
    path: '/preferentialActivitiesNew',
    children: [
      {
        meta: {
          keepAlive: true,
          title: '活动中心',
        },
        name: 'ActivityCenter',
        path: '/preferentialActivitiesNew/activityCenter',
        // @ts-ignore
        component: () => import('#/views/activity/ActivityCenter.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: '任务中心',
        },
        name: 'TaskCenter',
        path: '/preferentialActivitiesNew/taskCenter',
        // @ts-ignore
        component: () => import('#/views/activity/TaskCenter.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: '用户活动',
        },
        name: 'UserActivityDashboard',
        path: '/preferentialActivitiesNew/user-activities',
        // @ts-ignore
        component: () => import('#/views/user/ActivityDashboard.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: '优惠明细',
        },
        name: 'ActivityRewardReport',
        path: '/preferentialActivitiesNew/activity-reward-report',
        // @ts-ignore
        component: () => import('#/views/activity/ActivityRewardReport.vue'),
      },
      {
        meta: {
          icon: 'ic:outline-emoji-events',
          title: 'VIP奖励',
        },
        name: 'VIPReward',
        path: '/preferentialActivitiesNew/vip-reward',
        children: [
          {
            meta: {
              keepAlive: true,
              title: 'VIP奖励设置',
            },
            name: 'VIPRewardSetting',
            path: '/preferentialActivitiesNew/vip-reward/setting',
            // @ts-ignore
            component: () => import('#/views/vip/VIPRewardSetting.vue'),
          },
          {
            meta: {
              keepAlive: true,
              title: 'VIP奖励设置总览',
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
