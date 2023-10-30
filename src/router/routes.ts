import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),

    children: [
      { path: '/', component: () => import('pages/Start/Home.vue') },
      { path: 'login', component: () => import('pages/Start/Login.vue') },
      {
        path: 'user/:username',
        component: () => import('pages/Profile/UserProfile.vue'),
      },
      {
        path: 'id/:id',
        component: () => import('pages/Profile/UserProfileIDReferrer.vue'),
      },
      {
        name: 'register',
        path: 'register',
        component: () => import('pages/Start/Register.vue'),
      },
      {
        path: 'forgot',
        component: () => import('pages/Start/Forgot.vue'),
      },

      {
        name: 'privacy',
        path: 'privacy',
        component: () => import('pages/Start/PrivacyPolicy.vue'),
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
        component: () => import('pages/Files/File.vue'),
      },
      {
        path: 'p/:id',
        component: () => import('pages/Files/Permalink.vue'),
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
        component: () => import('pages/Start/Home.vue'),
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
        component: () => import('pages/Authenticated/DashboardFolder.vue'),
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
    component: () => import('pages/NotFound.vue'),
  },
];

export default routes;
