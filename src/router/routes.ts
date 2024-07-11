import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),

    children: [
      { path: '/', component: () => import('pages/Public/Home.vue') },
      {
        path: 'login',
        component: () => import('pages/Public/Login.vue'),
      },
      {
        name: 'register',
        path: 'register',
        component: () => import('pages/Public/Register.vue'),
      },
      {
        name: 'privacy',
        path: 'privacy',
        component: () => import('pages/Public/PrivacyPolicy.vue'),
      },
      {
        path: 'user/:username',
        component: () => import('pages/Public/UserProfile.vue'),
      },
    ],
  },

  // public file views, these are used for file sharing
  {
    path: '/files',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'file/:id',
        component: () => import('pages/Public/Files/SharedFile.vue'),
      },
      {
        path: 'p/:id',
        component: () => import('pages/Public/Files/Permalink.vue'),
      },
    ],
  },

  // dashboard views, these include all private data views
  // these are not intended to be accessed without being logged in
  {
    path: '/dashboard',
    meta: { requiresAuth: true },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'home',
        component: () => import('pages/Public/Home.vue'),
      },
      {
        path: 'settings',
        component: () => import('pages/Authenticated/Settings.vue'),
      },
      {
        path: 'settings/:page',
        component: () => import('pages/Authenticated/Settings.vue'),
      },
      {
        path: 'files',
        component: () => import('pages/Authenticated/Files.vue'),
      },
      {
        path: 'vpn',
        component: () => import('src/pages/Authenticated/VPN.vue'),
      },
      {
        path: 'torrent',
        component: () => import('src/pages/Authenticated/Torrent.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/NotFound.vue'),
  },
];

export default routes;
