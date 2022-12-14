import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/', component: () => import('pages/IndexPage.vue') },
      {
        path: 'user/:username',
        component: () => import('pages/UserProfile.vue'),
      },
      {
        path: 'id/:id',
        component: () => import('pages/UserProfileIDReferrer.vue'),
      },
      {
        path: 'p/:id',
        component: () => import('pages/public/Permalink.vue'),
      },
      {
        path: 'register',
        component: () => import('pages/Register.vue'),
      },
      {
        path: 'forgot',
        component: () => import('pages/Forgot.vue'),
      },
    ],
  },

  {
    path: '/public',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'document/:id',
        component: () => import('pages/public/PublicDocumentView.vue'),
      },
      {
        path: 'file/:id',
        component: () => import('pages/public/PublicFileView.vue'),
      },
      {
        path: 'folder/:id',
        component: () => import('pages/public/PublicFolderView.vue'),
      },
      {
        path: 'code/:id',
        component: () =>
          import('src/pages/public/PublicCodeEditor/CodeView.vue'),
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
      {
        path: 'doc/:id',
        component: () => import('src/pages/Authenticated/DocumentEditView.vue'),
      },
      {
        path: 'code/:id',
        component: () =>
          import('src/pages/Authenticated/CodeEditor/CodeView.vue'),
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
