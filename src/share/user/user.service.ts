import { APP_URL, httpService, router } from "@/share";
import { Entities, EntityViews } from "@/share/entity";
import { codeWorkingOutline, fileTrayFullOutline, gitNetworkOutline, infiniteOutline, pulseOutline } from 'ionicons/icons';
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
    icon: infiniteOutline,
    auth: true,
    lazy: true,
  },
  {
    id: Entities.Segments,
    name: '间隔图',
    icon: codeWorkingOutline, //<ion-icon name="barcode-outline"></ion-icon>
    lazy: true,
    auth: true,
  },
  {
    id: Entities.Telesignalling,
    name: '遥信总览',
    icon: pulseOutline,
    lazy: true,
    auth: true,
  },
  {
    id: Entities.Telemetry,
    name: '遥测总览', 
    icon: gitNetworkOutline,
    lazy: true,
    auth: true,
  },
  {
    id: Entities.Events,
    name: '事件查询',
    icon: fileTrayFullOutline,
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