import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-people',
      keepAlive: true,
      order: 200,
      title: 'page.menu.userManagement',
    },
    name: 'UserManagement',
    path: '/user-management',
    children: [
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.allMembers',
        },
        name: 'AllMembers',
        path: '/user-management/all-members',
        component: () =>
          import('../../../views/user-management/all-members/index.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.memberTierManagement',
        },
        name: 'MemberTierManagement',
        path: '/usermanagerNEW/memberTier',
        component: () =>
          import('../../../views/usermanagerNEW/memberTier/index.vue'),
      },
      {
        meta: {
          keepAlive: true,
          title: 'page.menu.registrationVerification',
        },
        name: 'RegistrationVerification',
        path: '/user-management/registration-verification',
        component: () =>
          import(
            '../../../views/user-management/registration-verification/index.vue'
          ),
      },
    ],
  },
];

export default routes;
