import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useLocalStore } from 'src/stores/localStore';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Update the router navigation guard

  Router.beforeEach((to, from, next) => {
    const localStore = useLocalStore();

    if (
      to.matched.some((record) => record.meta.requiresAuth) &&
      !localStore.isAuthenticated
    ) {
      // If in debug mode, allow access to protected routes
      if (localStore.isDebugMode) {
        next();
      } else {
        next({ path: '/login' });
      }
    } else {
      next();
    }
  });

  return Router;
});
