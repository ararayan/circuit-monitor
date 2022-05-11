import { NavigationGuardWithThis } from "vue-router";
import { YNCacheKey, cacheService } from "@/share";

const authGuards: NavigationGuardWithThis<undefined> = function (to, from, next) {
  if (to.meta.requireAuth) {
    if (to.path.startsWith('/login') || !!cacheService.get(YNCacheKey.AccessToken)) {
      next();
    }else {
      // check auth token exist
      next({
        path: '/login',
        replace: true,
      });
    }
  }else {
    next();
  }
};

export { authGuards };