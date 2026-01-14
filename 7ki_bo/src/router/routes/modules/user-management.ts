import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
   {
     meta: {
       icon: 'ic:baseline-people',
       keepAlive: true,
       order: 200,
       title: '用户管理',
     },
     name: 'UserManagement',
     path: '/user-management',
     children: [
       {
         meta: {
           title: '所有会员',
         },
         name: 'AllMembers',
         path: '/user-management/all-members',
         component: () => import('../../../views/user-management/all-members/index.vue'),
       },
       {
         meta: {
           title: '会员层级管理',
         },
         name: 'MemberTierManagement',
         path: '/usermanagerNEW/memberTier',
         component: () => import('../../../views/usermanagerNEW/memberTier/index.vue'),
       },
     ],
   },
];

export default routes; 