import { YNCacheKey, cacheService, DataStatus } from '@/share';
import { authService, RequestUserInfo, ResponseUserInfo } from '@/share/auth';
import { defineStore } from 'pinia';
import { catchError, delay, EMPTY, of, tap } from 'rxjs';
import { useRouter } from 'vue-router';
import { UserMenu, userService } from './user.service';

const user = cacheService.get(YNCacheKey.User) as ResponseUserInfo;


export interface UserState {
    isAuth: boolean;
    loginErrorMsg: string;
    user: ResponseUserInfo;
    menus: UserMenu[];
    menusStatus: DataStatus,
}

const initialState: UserState = user
  ? {isAuth: true, loginErrorMsg: '', user, menus: [] as UserMenu[], menusStatus: DataStatus.Unloaded, }
  : {
    isAuth: false, 
    loginErrorMsg: '',  
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
    invalid: (state) => {
      return !state.isAuth && !!state.loginErrorMsg;
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

export const useUserStore = () => {
  const instance = userStoreFactory();
  // check is auto unsubscribe when store is dispose;
  instance.$subscribe((mutation,state) => {
    instance.getUserMenu();
  }, {immediate: true, detached: true, deep: false});
  return instance;
};

