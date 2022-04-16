import { CacheKeys, cacheService, httpService } from "@/share";
import { APP_URL } from '@/share';
import { of } from "rxjs";
import { tap } from "rxjs/operators";

export interface RequestUserInfo {
  userName: string;
  password: number;
}
export interface ResponseUserInfo {
  userId: string;
  userName: string;
  roleId: number;
  token: string;
}

class AuthService {
  login(user: RequestUserInfo) {
    return httpService.post<ResponseUserInfo>(APP_URL.Login, user).pipe(
      tap(() => {
        const abc = {...user, token: '__test_token__'};
        cacheService.set(CacheKeys.User, abc);
      })
    );
  }
  logout() {
    return of(cacheService.remove(CacheKeys.User));
  }
}

export const authService = new AuthService();