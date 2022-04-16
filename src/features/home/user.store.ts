import { cacheService,} from '@/share';
import { defineStore  } from 'pinia';
import { delay } from 'rxjs';
import { userService } from './user.service';
import { useRouter } from 'vue-router';
import { authService, RequestUserInfo, ResponseUserInfo } from './auth.service';

const user = cacheService.get('user') as Omit<ResponseUserInfo, 'token'>;

export interface UserState {
    status: {
        isAuth: boolean;
    };
    user: Omit<ResponseUserInfo, 'token'>;
    menus: any[];
}

const initialState: UserState = user
  ? { status: { isAuth: true }, user, menus: [] }
  : { status: { isAuth: false }, user, menus: [] };

export const userStore = defineStore('user', {
  state: () => initialState,
  actions: {
    login(user: RequestUserInfo) {
      authService.login(user).subscribe((response: any) => {
        this.status.isAuth = true;
        this.user = {
          userName: response.userName,
          userId: response.userId,
          roleId: response.roleId,
        };
      });
    },
    logout() {
      authService.logout().subscribe(() => {
        this.status.isAuth = false;
      });
    },
    getUserMenu() {
      if (this.status.isAuth) {
        userService.getUserMenus().pipe(delay(1000)).subscribe((response) => {
          debugger;
          this.menus = response;
        });
      }else {
        const router = useRouter();
        router.push('/login');
      }
    }
  }
});