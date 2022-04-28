import { NavigationGuardWithThis } from "vue-router";
import { CacheKeys, cacheService } from "@/share";

const authGuards: NavigationGuardWithThis<undefined> = function (to, from, next) {
  if (to.meta.requireAuth) {
    if (to.path.startsWith('/login') || !!cacheService.get(CacheKeys.User)) {
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