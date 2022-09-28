import { defineStore } from "pinia";
import { Subject, interval, EMPTY } from "rxjs";
import { switchMap } from "rxjs/operators";
import { httpService, YNAPI_SJCX, YN_BASE_URL } from "../http";

function formatDateToEmergencyParams (date: Date) {
  const firstPart = `${date.getFullYear()}/${date.getMonth()}/${ date.getDate()}`;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const secondsPart = `${hours >= 10 ? '' + hours : '0' + hours}:${minutes >= 10 ? '' + minutes : '0' + minutes }:${seconds >= 10 ? '' + seconds : '0' + seconds }`;
  return `${firstPart} ${secondsPart}`;
}


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
        emergencyEvents: [],
        startEmergencyEventsCheck: false,
        emergencyEventsCheckDateTime: '',
        errorMsgLogs: [] as Array< {url: string, params: any, msg: string}>,
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
      startCheckEmergencyEvents() {
        if (!this.startEmergencyEventsCheck) {
          this.$patch({
            startEmergencyEventsCheck: true
          });
          // interval(8000).pipe(
          //   switchMap(() => {
          //     return  httpService.post(YNAPI_SJCX.GetEmergencyEvents, {
          //       validateDate: this.emergencyEventsCheckDateTime || formatDateToEmergencyParams(new Date()),
          //       recordName: ''
          //     }, {headers: {errorSilent: true}, });
          //   })
          // )
          httpService.post(YNAPI_SJCX.GetEmergencyEvents, {
            validateDate: this.emergencyEventsCheckDateTime || formatDateToEmergencyParams(new Date()),
            recordName: ''
          }, {headers: {errorSilent: true}, }).pipe(
            switchMap(response => {
              // const action = response.data || {} as {result: any[], validateDate: string};
              // let retryCount = 5;
              // const intervelTime = 2000;
              // // eslint-disable-next-line no-constant-condition
              // if (action.isYxEffect && action.sendActionSuccess) {
              //   return of(0).pipe(
              //     switchMap(() => {
              //       return httpService.post<YxCheckResponse>(YNAPI_KZCZ.CheckControlResult, {
              //         controlType: OperatorType.RemoteSelect,
              //         yxIds: data.yxIds,
              //         action: data.action,
              //       }, skipMaskConfig);
              //     }),
              //     repeat({
              //       count: retryCount + 1,
              //       delay: () => {
              //         retryCount--;
              //         return of(0).pipe(delay(intervelTime));
              //       }
              //     }),
              //     catchError(err => {
              //       console.error(err.message);
              //       return of({data: {hasNewControlResult: 0, result: 0}});
              //     }),
              //     filter(x => {
              //       const checkResult = x.data;
              //       if ((!checkResult.hasNewControlResult && checkResult.result === 1) || !retryCount) {
              //         return true;
              //       } 
              //       return false;
              //     }),
              //     take(1),
              //   );        
              // }
              // this.$patch({
              //   operatorMsg: '申请遥控选择失败.'
              // });
              return EMPTY;
            }),
          ).subscribe();
        }
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
