import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/', component: () => import('pages/IndexPage.vue') },
      {
        path: 'reset_password',
        component: () => import('pages/ResetPassword.vue'),
      },
      {
        path: 'accepted',
        component: () => import('pages/Accepted.vue'),
      },
      {
        path: 'declined',
        component: () => import('pages/Declined.vue'),
      },
    ],
  },
  {
    path: '/l',
    component: () => import('layouts/LoggedLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/l/StartPage.vue') },
      {
        path: 'profile',
        component: () => import('src/pages/l/MyProfile.vue'),
      },
      {
        path: 'settings',
        component: () => import('src/pages/l/Settings.vue'),
      },
      {
        path: 'users/:id',
        component: () => import('pages/l/UserProfile.vue'),
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
