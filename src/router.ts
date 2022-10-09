import { RouteRecordRaw } from "vue-router";
import { createRouter, createWebHistory } from '@ionic/vue-router';
import HomeView from '@/views/home-view.vue';
import LoginView from '@/views/login-view.vue';
import NotFoundView from '@/views/not-found-view.vue';
import EntityView from '@/views/entity/entity-view.vue';
import AboutView from '@/views/about-view.vue';
import UserView from '@/views/user-view.vue';
import EmergencyEventsView from '@/views/emergency-events.vue';

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
  {
    path: '/emergencyevents',
    component: EmergencyEventsView,
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
    /** 
    * ionic route outlet will cache the props calc by performance, below is the source code comment
    * Since IonRouterOutlet renders multiple components,
    * each render will cause all props functions to be
    * called again. As a result, we need to cache the function
    * result and provide it on each render so that the props
    * are not lost when navigating from and back to a page.
    * When a component is destroyed and re-created, the
    * function is called again.
    */
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
      // debugger;
      anyCount++;
      if (anyCount > 1) {
        anyCount = 0;
        return { path: '/not-found', replace: true, query: {} };
      }
      return { path: '/home',  replace: true, query: { q: to.path } };
    },
  }
];

export const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});


