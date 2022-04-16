import { RouteRecordRaw } from 'vue-router';
import HomeView from './home-view.vue';
import LoginView from './login-view.vue';
import NotFoundView from './not-found-view.vue';

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
      // 方法接收目标路由作为参数
      // return 重定向的字符串路径/路径对象
      anyCount++;
      if (anyCount > 1) {
        anyCount = 0;
        return { path: '/not-found', replace: true, query: {} };
      }
      return { path: '/home', query: { q: to.path } };
    },
  }
  
];




