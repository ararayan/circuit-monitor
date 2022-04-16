import { NavigationGuardWithThis } from "vue-router";
import { CacheKeys, cacheService } from "@/share";

const authGuards: NavigationGuardWithThis<undefined> = function (to, from, next) {
  if (to.meta.requireAuth) {
    if (to.path.startsWith('/login') || !!cacheService.get(CacheKeys.AccessToken)) {
      next();
    }else {
      // check auth token exist
      next({
        path: '/login',
        query: {
          to: to.fullPath,
        }
      });
    }
  }else {
    next();
  }
};

export { authGuards };