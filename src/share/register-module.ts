import { RouteRecordRaw } from "vue-router";
import { createRouter, createWebHistory } from '@ionic/vue-router';

export const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: []
});


export interface ModularFeature {
  // store?: StoreDefinition;
  routes?: Array<RouteRecordRaw>;
  // /**only one global guards hook in entry shell module */
  // beforeEachGuards?: NavigationGuardWithThis<undefined>
}

const registerModule = (name: string, module: ModularFeature) => {
  module?.routes?.forEach(route => router.addRoute(route));
};

export const registerModules = (modules: {[key: string]: ModularFeature}) => {
  Object.keys(modules).forEach(moduleKey => {
    const module = modules[moduleKey];
    registerModule(moduleKey, module);
  });
};