import { defineStore } from "pinia";
import { Subject } from "rxjs";



export const APPId = 'YNAPP';

export function useAppStore() {
  const destory$ = new Subject<boolean>();
  return defineStore(APPId, {
    state: () => {
      const initialState = {
        loadingCount: 0,
        isNetWorkError: false,
      };
      return { ...initialState };
    },
    actions: {
      setLoadingCount(value: number) {
        this.$patch({loadingCount: value});
      },
      setNetWorkError() {
        this.$patch({ isNetWorkError: true});
      },
      reset() {
        destory$.next(true);
        this.$reset();
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
