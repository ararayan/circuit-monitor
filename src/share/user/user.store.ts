import { cacheService, DataStatus, CacheKeys, getStateMetaKey} from '@/share';
import { defineStore  } from 'pinia';
import { catchError, delay, of, tap } from 'rxjs';
import { UserMenu, userService } from './user.service';
import { useRouter } from 'vue-router';
import { authService, RequestUserInfo, ResponseUserInfo } from '@/share/auth';

const user = cacheService.get(CacheKeys.User) as Omit<ResponseUserInfo, 'token'>;

export interface UserState {
    isAuth: boolean;
    user: Omit<ResponseUserInfo, 'token'>;
    menus: UserMenu[];
    menusStatus: DataStatus
}

const initialState: UserState = user
  ? {isAuth: true, user, menus: [] as UserMenu[], menusStatus: DataStatus.Unloaded}
  : {isAuth: false, user, menus: []  as UserMenu[], menusStatus: DataStatus.Unloaded };

const userStoreFactory =  defineStore('user', {
  state: () => initialState,
  actions: {
    login(user: RequestUserInfo) {
      authService.login(user).subscribe((response: any) => {
        this.isAuth = true;
        this.user = {
          userName: response.userName,
          userId: response.userId,
          roleId: response.roleId,
        };
      });
    },
    logout() {
      authService.logout().subscribe(() => {
        this.isAuth = false;
      });
    },
    getUserMenu() {
      if (this.isAuth) {
        userService.getUserMenus().pipe(
          tap(() => { this.menusStatus = DataStatus.Loading; }),
          delay(50),
          catchError(error => {
            this.menusStatus = DataStatus.Error;
            return of(error);
          })
        ).subscribe((response) => {
          this.menus = response;
          this.menusStatus = DataStatus.Loaded;
        });
      }else {
        const router = useRouter();
        if (!router.currentRoute.value.path.startsWith('/login')) {
          router.push('/login');
        }
      }
    }
  }
});  

export const useUserStore = () => {
  const instance = userStoreFactory();
  // check is auto unsubscribe when store is dispose;
  instance.$subscribe((mutation,state) => {
    if (state.menusStatus === DataStatus.Unloaded) {
      instance.getUserMenu();
    }
  }, {immediate: true, detached: true, deep: false});
  return instance;
};

