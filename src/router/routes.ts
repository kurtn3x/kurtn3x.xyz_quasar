import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/', component: () => import('pages/IndexPage.vue') },
      {
        path: 'settings',
        component: () => import('src/pages/Settings.vue'),
      },
      {
        path: 'users/:id',
        component: () => import('pages/UserProfile.vue'),
      },
    ],
  },

  {
    path: '/api',
    component: () => import('layouts/APIReferrersLayout.vue'),
    children: [
      { path: '/', component: () => import('pages/ErrorNotFound.vue') },
      {
        path: 'reset_password',
        component: () => import('pages/APIReferrers/ResetPassword.vue'),
      },
      {
        path: 'accepted',
        component: () => import('pages/APIReferrers/Accepted.vue'),
      },
      {
        path: 'declined',
        component: () => import('pages/APIReferrers/Declined.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
