import { YNCacheKey, cacheService, httpService, StorageType } from "@/share";
import { APP_URL } from '@/share';
import { of } from "rxjs";
import { map, tap } from "rxjs/operators";

export interface RequestUserInfo {
  userName: string;
  password: string;
  remenberPassword: boolean;
}
export interface ResponseUserInfo {
  userId: string;
  userName: string;
  roleId: number;
  remenberPassword: boolean;
  password: string;
}
// remenber true, userName and password save in localStorage
// remenber false, userName and password save in sessionStorage

class AuthService {
  login(user: RequestUserInfo) {
    return httpService.post<ResponseUserInfo>(APP_URL.Login, user).pipe(
      map(() => {
        const responseUser: ResponseUserInfo = {
          userId: '_user_id_1_',
          userName: user.userName,
          remenberPassword: user.remenberPassword,
          roleId: 789789,
          password: user.remenberPassword ? user.password : '',
        };
        // need remove, may user data store in diff storage in prev and next; 
        cacheService.remove(YNCacheKey.User);
        cacheService.set(YNCacheKey.User, responseUser, user.remenberPassword ? StorageType.Persistent : StorageType.Session);
        cacheService.set(YNCacheKey.AccessToken,  '__test_token__',  StorageType.Session);
        return responseUser;
      })
    );
  }
  logout() {
    return of(cacheService.remove(YNCacheKey.AccessToken));
  }
}

export const authService = new AuthService();