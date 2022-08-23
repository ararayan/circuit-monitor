import { defineStore } from "pinia";
import { Subject } from "rxjs";
import { httpService, YN_BASE_URL } from "../http";



export const APPId = 'YNAPP';

export function useAppStore() {
  const destory$ = new Subject<boolean>();
  return defineStore(APPId, {
    state: () => {
      const initialState = {
        loadingCount: 0,
        isNetWorkError: false,
        isActive:  false,
        openUrl: '',
        baseUrl: YN_BASE_URL,
        isBaseURLInited: false,
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
          this.isBaseURLInited = true;
          httpService.setBaseUrl(url);
        }else {
          this.isBaseURLInited = false;
        }

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
