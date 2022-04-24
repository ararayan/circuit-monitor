import { APP_URL, httpService, router } from "@/share";
import { Entities, EntityViews } from "@/share/entity";
// import { codeWorkingOutline, fileTrayFullOutline, gitNetworkOutline, infiniteOutline, pulseOutline } from 'ionicons/icons';
import { map } from "rxjs/operators";
import { Router } from "vue-router";

export interface UserMenu {
    id: keyof EntityViews;
    name: string;
    icon: string;
    lazy: true,
    chunkName?: string;
    auth: boolean;
}


const UserMenus: UserMenu[] =  [
  {
    id: Entities.Wirings,
    name: '接线图',
    icon: '',
    auth: true,
    lazy: true,
  },
  {
    id: Entities.Segments,
    name: '间隔图',
    icon: '', //<ion-icon name="barcode-outline"></ion-icon>
    lazy: true,
    auth: true,
  },
  {
    id: Entities.Realtime,
    name: '实时数据',
    icon: '',
    lazy: true,
    auth: true,
  },
  {
    id: Entities.Operations,
    name: '控制操作', 
    icon: '',
    lazy: true,
    auth: true,
  },
  {
    id: Entities.LightingControl,
    name: '照明管理', 
    icon: '',
    lazy: true,
    auth: true,
  },
  {
    id: Entities.Events,
    name: '事件查询',
    icon: '',
    lazy: true,
    auth: true,
  },
];


class UserService {
  constructor(protected router: Router) {}
  getUserMenus() {
    return httpService.post<UserMenu[]>(APP_URL.GetUserMenus).pipe(
      map(() => {
        return UserMenus;
      }),
    );
  }
}

export const userService = new UserService(router);