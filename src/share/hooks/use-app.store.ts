import { defineStore } from "pinia";
import { BehaviorSubject, Subject, } from "rxjs";
import { httpService, YN_BASE_URL } from "../http";

const destory$ = new Subject<boolean>();
const isAppActive$ = new BehaviorSubject(false);
(window as any)['abc'] = isAppActive$;

const appStore = defineStore('App', {
  state: () => {
    const initialState = {
      isNetWorkError: false,
      isActive:  true,
      openUrl: '',
      baseUrl: YN_BASE_URL,
      enterBaseURLInited: false, 
      debug: false,
      requestLogs: [] as Array< {url: string, params: any, msg: string}>,
      errorMsgLogs: [] as Array< {url: string, params: any, msg: string}>,
      localNotificationsPermissions: false,
    };
   
    return { ...initialState };
  },
  actions: {
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
      if (this.debug) {
        this.$patch({
          errorMsgLogs: [...this.errorMsgLogs, errorInfo]
        });
      }
    },
    logRequest(requestInfo: {url: string, params: any, msg: string}) {
      if (this.debug) {
        this.$patch({
          requestLogs: [...this.requestLogs, requestInfo]
        });
      }
    },
    destroy() {
      // fix: pinia.state will cache state even the store instance was remove by call self dispose;
      // manual call reset make cahce state backto inital status; more detail see the state fn on below;
      this.reset();
      destory$.complete();
      this.$dispose();
    },
  }
});

let isSubscribed = false;

export function useAppStore() {
  const store = appStore();
  if (!isSubscribed) {
    store.$subscribe(() => {
      if (isAppActive$.value !== store.isActive) {
        isAppActive$.next(store.isActive);
      }
    }, {immediate: true});
    isSubscribed = true;
  }
  return store;
}

export const appState$ = isAppActive$.asObservable();
