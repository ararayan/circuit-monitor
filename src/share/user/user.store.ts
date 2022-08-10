import { YNCacheKey, cacheService, DataStatus } from '@/share';
import { authService, RequestUserInfo, ResponseUserInfo, UpdatePasswordInfo } from '@/share/auth';
import { defineStore } from 'pinia';
import { of,  } from 'rxjs';
import {  catchError, delay, take, tap } from 'rxjs/operators'
import { UserMenu, userService } from './user.service';

const user = cacheService.get(YNCacheKey.User) as ResponseUserInfo;


export interface UserState {
    isAuth: boolean;
    loginErrorMsg: string;
    updatePasswordResultMsg: string;
    user: ResponseUserInfo;
    menus: UserMenu[];
    menusStatus: DataStatus,
}

const initialState: UserState = user
  ? {isAuth: true, loginErrorMsg: '',  updatePasswordResultMsg: '', user, menus: [] as UserMenu[], menusStatus: DataStatus.Unloaded, }
  : {
    isAuth: false, 
    loginErrorMsg: '',
    updatePasswordResultMsg: '',
    user: {
      userId: '',
      userName: '',
      loginUserName: '',
      email: '',
      remenberPassword: false,
      password: '',
    },
    menus: []  as UserMenu[], 
    menusStatus: DataStatus.Unloaded, 
  };

const userStoreFactory =  defineStore('user', {
  state: () => initialState,
  getters: {
    loginError: (state) => {
      return !state.isAuth && !!state.loginErrorMsg;
    },
    updatePasswordError: (state) => {
      return !!state.updatePasswordResultMsg;
    }
  },
  actions: {
    login(user: RequestUserInfo) {
      authService.login(user).pipe(
        tap(() => {
          this.$patch({
            loginErrorMsg: ''
          });
        }),
      ).subscribe(response => {
        if (response.success) {
          this.$patch({
            isAuth: true,
            loginErrorMsg: '',
            user: response.user as ResponseUserInfo,
          });
        }else {
          this.$patch({
            isAuth: false,
            loginErrorMsg: response.message,
          });
        }
      });
    },
    logout() {
      authService.logout().subscribe(() => {
        this.$patch({
          isAuth: false,
          loginErrorMsg: '',
        });
      });
    },
    resetUserInfo() {
      this.$patch({
        isAuth: false,
        loginErrorMsg: '',
        updatePasswordResultMsg: '',
        user: {
          password: '',
        }
      });
    },
    updatePassword(updateInfo: UpdatePasswordInfo) {
      if (updateInfo.newPwd !== updateInfo.newPwd2) {
        this.$patch({
          updatePasswordResultMsg: '确认密码与新密码不匹配，请重新输入.'
        });
        return ;
      }
      authService.updatePassword(updateInfo).pipe(take(1)).subscribe();
    },
    resetUpdatePwdValidation(){
      this.$patch({
        updatePasswordResultMsg: ''
      });
    },
    emptyLoginErrorMsg(){
      this.$patch({
        loginErrorMsg: ''
      });
    },
    getUserMenu() {
      if (this.menusStatus !== DataStatus.Unloaded) {
        return ;
      }
      if (this.isAuth) {
        userService.getUserMenus().pipe(
          tap(() => { this.menusStatus = DataStatus.Loading; }),
          delay(0),
          catchError(error => {
            this.menusStatus = DataStatus.Error;
            return of(error);
          })
        ).subscribe((response) => {
          // debugger;
          this.menus = response;
          this.menusStatus = DataStatus.Loaded;
        });
      }
      // else {
      //   const router = useRouter();
      //   if (!router.currentRoute.value.path.startsWith('/login')) {
      //     router.push('/login');
      //   }
      // }
    },
  }
});  

type UserStoreFactory = typeof userStoreFactory;
let instance: ReturnType<UserStoreFactory>;

export const useUserStore = () => {
  if (!instance) {
    instance = userStoreFactory();
    // check is auto unsubscribe when store is dispose;
    instance.$subscribe((mutation,state) => {
      instance.getUserMenu();
    }, {immediate: true, detached: true, deep: false});
  }
  return instance;
};

