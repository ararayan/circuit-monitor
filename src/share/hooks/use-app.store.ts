import { alertService } from "@/share/alert.service";
import { LocalNotifications } from '@capacitor/local-notifications';
import { defineStore } from "pinia";
import { from, of, Subject } from "rxjs";
import { catchError, delay, map, repeat, switchMap, tap } from "rxjs/operators";
import { httpService, YNAPI_SJCX, YN_BASE_URL } from "../http";
import { toastService } from "@/share/toast.service";





const destory$ = new Subject<boolean>();

export function useAppStore() {
  return defineStore('YNAPP', {
    state: () => {
      const initialState = {
        loadingCount: 0,
        isNetWorkError: false,
        isActive:  false,
        openUrl: '',
        baseUrl: YN_BASE_URL,
        enterBaseURLInited: false, 
        debug: false,
        errorMsgLogs: [] as Array< {url: string, params: any, msg: string}>,
        localNotificationsPermissions: false,
      };
     
      return { ...initialState };
    },
    actions: {
      setLoadingCount(value: number) {
        this.$patch({loadingCount: value});
      },
      setBaseUrl(url: string) {
        if (url) {
          this.baseUrl = url;
          this.enterBaseURLInited = false;
          httpService.setBaseUrl(url);
        }else {
          this.enterBaseURLInited = true;
        }

      },
      setDebugMode(value: boolean) {
        this.debug =  value;
      },
      setNetWorkError() {
        this.$patch({ isNetWorkError: true});
      },
      reset() {
        destory$.next(true);
        this.$reset();
      },
      setActive(isActive: boolean) {
        this.$patch({
          isActive
        });
      },
      setOperUrl(url: string) {
        this.$patch({
          openUrl: url
        });
      },
      logError(errorInfo: {url: string, params: any, msg: string}) {
        this.$patch({
          errorMsgLogs: [...this.errorMsgLogs, errorInfo]
        });
      },
      destroy() {
        // fix: pinia.state will cache state even the store instance was remove by call self dispose;
        // manual call reset make cahce state backto inital status; more detail see the state fn on below;
        this.reset();
        destory$.complete();
        this.$dispose();
      },
    }
  })();
}
