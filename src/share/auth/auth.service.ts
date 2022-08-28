import { cacheService, httpService, StorageType, YNAPI_System, YNCacheKey } from "@/share";
import { of } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";

let superadminPwd = '123';
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
    let responseUser: ResponseUserInfo;
    if (user.userName === 'superadmin' && user.password === superadminPwd) {
      const token = `token_${new Date().getTime()}`;
      responseUser = {
        userId: 'superadmin123',
        userName: '陈先生',
        loginUserName: 'superadmin',
        email: 'chenzhijie@163.com',
        remenberPassword: user.remenberPassword,
        password: user.remenberPassword ? user.password : '',
      };
      // need remove, may user data store in diff storage in prev and next; 
      cacheService.remove(YNCacheKey.User);
      cacheService.set(YNCacheKey.User, responseUser, user.remenberPassword ? StorageType.Persistent : StorageType.Session);
      cacheService.set(YNCacheKey.AccessToken,  token,  StorageType.Session);

      return of({
        success: true,
        message: '登陆成功!',
        user: responseUser
      });
    }
    return of({
      success: false,
      message: '用户名或密码错误!',
      user: {
        userId: 'superadmin123',
        userName: '陈先生',
        loginUserName: 'superadmin',
        email: 'chenzhijie@163.com',
        remenberPassword: user.remenberPassword,
        password: user.remenberPassword ? user.password : '',
      }
    });

    // return httpService.post<UserResponseInfo>(YNAPI_System.Login, {loginUserName: user.userName, pwd: user.password }).pipe(
    //   catchError(error => {
    //     return of({
    //       data: {
    //         success: false,
    //         message: (error?.message?.toString()|| '') as string ,
    //         custom: {}
    //       },
    //     });
    //   }),
    //   map(response => {
    //     let responseUser: ResponseUserInfo | null = null;
    //     if (response?.data?.success) {
    //       const token = response.data.custom.Token;
    //       responseUser = {
    //         userId: response.data.custom.UserID,
    //         userName: response.data.custom.UserName,
    //         loginUserName: response.data.custom.LoginName,
    //         email: response.data.custom.Email,
    //         remenberPassword: user.remenberPassword,
    //         password: user.remenberPassword ? user.password : '',
    //       };
          
    //       // need remove, may user data store in diff storage in prev and next; 
    //       cacheService.remove(YNCacheKey.User);
    //       cacheService.set(YNCacheKey.User, responseUser, user.remenberPassword ? StorageType.Persistent : StorageType.Session);
    //       cacheService.set(YNCacheKey.AccessToken,  token,  StorageType.Session);
    //     }
    //     return {
    //       success: response.data.success,
    //       message: response.data.message || '',
    //       user: responseUser
    //     };        
    //   }),

    // );
  }
  logout() {
    cacheService.remove(YNCacheKey.AccessToken);
    return of(null);
    // return httpService.post<ResponseUserInfo>(YNAPI_System.LogOut).pipe(
    //   tap(() => {
    //     cacheService.remove(YNCacheKey.AccessToken); 
    //   })
    // );
  }
  updatePassword(params: UpdatePasswordInfo) {
    return of({message: '更新密码成功。'}).pipe(
      tap(() => superadminPwd = params.newPwd)
    );
    // return httpService.post<{message: string; success: boolean}>(YNAPI_System.UpdatePwd, params).pipe(
    //   map(response => {
    //     return response.data;
    //   })
    // );
  }
  checkPassword(password: string) {
    return of(superadminPwd === password);
    // return httpService.post<boolean>(YNAPI_System.CheckPassword, { password}).pipe(
    //   map((response => {
    //     return response.data;
    //   }))
    // );
  }
}

export const authService = new AuthService();
