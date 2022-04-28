import { RouteRecordRaw } from "vue-router";
import { createRouter, createWebHistory } from '@ionic/vue-router';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import EntityView from '@/views/EntityView.vue';
import AboutView from '@/views/AboutView.vue';
import UserView from '@/views/UserView.vue';

let anyCount = 0;
export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: {replace: true, path: '/home'},
  },
  {
    path: '/home',
    component: HomeView,
    meta: {requireAuth: true}
  },
  {
    path: '/user',
    component: UserView,
    meta: {requireAuth: true}
  },
  {
    path: '/about',
    component: AboutView,
    meta: {requireAuth: true}
  },
  // {
  //   path: '/entity/:entityName/:recordId?',
  //   component: EntityView,
  //   meta: {requireAuth: true}
  // },
  {
    path: '/entity/:parentEntityName?/:parentRecordId?/:entityName?/:recordId?',
    component: EntityView,
    meta: {requireAuth: true},
    props: route => {
      return { tab: route.query.tab };
    }
  },
  // {
  //   path: '/entity/:entityName/:recordId',
  //   component: () => import(/* webpackChunkName: "[request]" */ `@/views/EntityManageView.vue`),
  //   meta: {requireAuth: true}
  // },
  {
    path: '/login',
    component: LoginView
  },
  {
    path: '/not-found',
    component: NotFoundView,
  },
  {
    path: '/:catchAll(.*)',
    redirect: to => {
      debugger;
      anyCount++;
      if (anyCount > 1) {
        anyCount = 0;
        return { path: '/not-found', replace: true, query: {} };
      }
      return { path: '/home', query: { q: to.path } };
    },
  }
];

export const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});
