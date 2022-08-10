import { YNCacheKey, cacheService, httpService, StorageType, YNAPI_System } from "@/share";
import { of, throwError } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { alertService } from "../alert.service";

export interface RequestUserInfo {
  userName: string;
  password: string;
  remenberPassword: boolean;
}
export interface ResponseUserInfo {
  userId: string;
  userName: string;
  loginUserName: string;
  email: string;
  remenberPassword: boolean;
  password: string;
}

interface UserResponseInfo {
  custom: any
  message: string;
  success: boolean;
}

export type UpdatePasswordInfo =  Record<'oldPwd' | 'newPwd' | 'newPwd2', string>;
// remenber true, userName and password save in localStorage
// remenber false, userName and password save in sessionStorage

class AuthService {
  login(user: RequestUserInfo) {
    return httpService.post<UserResponseInfo>(YNAPI_System.Login, {loginUserName: user.userName, pwd: user.password }).pipe(
      catchError(error => {
        return of({
          data: {
            success: false,
            message: (error?.message?.toString()|| '') as string ,
            custom: {}
          },
        });
      }),
      map(response => {
        let responseUser: ResponseUserInfo | null = null;
        if (response?.data?.success) {
          const token = response.data.custom.Token;
          responseUser = {
            userId: response.data.custom.UserID,
            userName: response.data.custom.UserName,
            loginUserName: response.data.custom.LoginName,
            email: response.data.custom.Email,
            remenberPassword: user.remenberPassword,
            password: user.remenberPassword ? user.password : '',
          };
          
          // need remove, may user data store in diff storage in prev and next; 
          cacheService.remove(YNCacheKey.User);
          cacheService.set(YNCacheKey.User, responseUser, user.remenberPassword ? StorageType.Persistent : StorageType.Session);
          cacheService.set(YNCacheKey.AccessToken,  token,  StorageType.Session);
        }
        return {
          success: response.data.success,
          message: response.data.message || '',
          user: responseUser
        };        
      }),

    );
  }
  logout() {
    return httpService.post<ResponseUserInfo>(YNAPI_System.LogOut).pipe(
      tap(() => {
        cacheService.remove(YNCacheKey.AccessToken); 
      })
    );
    // return of(cacheService.remove(YNCacheKey.AccessToken));
  }
  updatePassword(params: UpdatePasswordInfo) {
    return httpService.post(YNAPI_System.UpdatePwd, params).pipe(
      tap(response => {
        debugger;
      }),
      catchError(err => {
        debugger;
        return of(err);
      })
    );
  }
}

export const authService = new AuthService();
