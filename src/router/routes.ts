import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/', component: () => import('pages/IndexPage.vue') },
      {
        path: 'user/:id',
        component: () => import('pages/UserProfile.vue'),
      },
    ],
  },

  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'home',
        component: () => import('pages/Authenticated/Home.vue'),
      },
      {
        path: 'settings',
        component: () => import('pages/Authenticated/Settings.vue'),
      },
      {
        path: 'files',
        component: () => import('pages/Authenticated/Files.vue'),
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
  // {
  //   path: '/:catchAll(.*)*',
  //   component: () => import('pages/ErrorNotFound.vue'),
  // },
];

export default routes;
