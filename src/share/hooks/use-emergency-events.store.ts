import { IonicPredefinedColors } from "@/model";
import { appState$, useAppStore } from "@/share/hooks/use-app.store";
import { httpService, YNAPI_SJCX } from "@/share/http";
import { toastService } from "@/share/toast.service";
import { Http } from '@capacitor-community/http';
import { LocalNotifications } from '@capacitor/local-notifications';
import { alertController } from "@ionic/vue";
import { BackgroundFetch } from "@transistorsoft/capacitor-background-fetch";
import { closeOutline } from 'ionicons/icons';
import { defineStore } from "pinia";
import { asyncScheduler, combineLatest, EMPTY, from, of, Subject } from "rxjs";
import { catchError, delay, dematerialize, finalize, map, materialize, repeat, switchMap, takeUntil, tap } from "rxjs/operators";
import { cacheService, YNCacheKey } from "../cache.service";
import { CheckEmergencyEventsResponseData } from "../emergency.service";
import { auth$ } from "../user/user.store";


function fetchEmergencyEvents_axios$(startIndex: number) {
  return httpService.post<CheckEmergencyEventsResponseData>(YNAPI_SJCX.GetEmergencyEvents, {
    startIndex: startIndex,
    recordName: ''
  }, {headers: {errorSilent: true, skipMask: true}, }).pipe(
    catchError(() => of({data: null})),
    map(response => response.data || {events: [], startIndex: startIndex }),
    // tap(result => this.startIndex = result.startIndex),
    // switchMap(() => {
    //   this.records = [...this.records, {seq: ++emergencyEventCount,  message: '测试突发事件' }];
    //   return from(LocalNotifications.schedule({
    //     notifications: [{
    //       schedule: {
    //         allowWhileIdle: true,
    //       },
    //       id: new Date().getTime(),
    //       largeBody: 'Capacitor considers each platform project a source asset instead of a build time asset. That means, Capacitor wants you to keep the platform source code in the repository, unlike Cordova which always assumes that you will generate the platform code on build time',
    //       title: 'Test Notification',
    //       body: '测试突发事件',
    //       // group: 'EmergencyEvents', // need setGroup
    //     }]
    //   }));
    // }),
  );
}

function fetchEmergencyEvents$(url: string, startIndex: number, tokenString?: string) {
  const token = tokenString || cacheService.get(YNCacheKey.AccessToken);
  return from(Http.request({
    url,
    method: 'POST',
    headers: {
      ['content-type']: 'application/x-www-form-urlencoded',
      token,
    },
    connectTimeout: 5000,
    responseType: 'json',
    data: new URLSearchParams({startIndex: startIndex.toString(), recordName: ''}),
  })).pipe(
    catchError(err => {
      return of({data: {events: [], startIndex: startIndex }});
    }),
    map(response => {
      return response.data;
    }),
  );
}

let emergencyEventCount = 0;

const destroy$ = new Subject<boolean>();

export function useEmergencyEvents() {
  return defineStore('emergencyEvents', {
    state: () => {
      const initialState = {
        fgCheckStarted: false,
        bgCheckStarted: false,
        startIndex: 0,
        records: [] as {seq: number, message: string}[],
        emgEventLogs: [] as string[],
      };
      return { ...initialState };
    },
    actions: {
      async enableFgCheck() {
        if (!this.fgCheckStarted) {
          const appStore = useAppStore();
          this.fgCheckStarted = true;

          // const token = cacheService.get(YNCacheKey.AccessToken);
          // let response: HttpResponse;
          // try {
          //   response = await Http.request({
          //     url: `${appStore.baseUrl}/${YNAPI_SJCX.GetEmergencyEvents}`,
          //     method: 'POST',
          //     headers: {
          //       ['content-type']: 'application/x-www-form-urlencoded',
          //       token,
          //     },
          //     connectTimeout: 5 * 1000,
          //     responseType: 'json',
          //     data: new URLSearchParams({startIndex: this.startIndex.toString(), recordName: ''}),
          //   });
          // } catch(err) { 
          //   // notth
          // }

          combineLatest([auth$, appState$]).pipe(
            switchMap(([x, y]) => {
              // use materialize wrap next/error/complete to next, so the of(x) will emit the next value that come from complete
              return !!x && !!y ? of(true).pipe(materialize()) : EMPTY;
            }),
            // use dematerialize unwrap the next to origin in which previous was complete, so the repeat treat the source was complete
            dematerialize(),
            delay(10 * 1000, asyncScheduler),
            switchMap(() => {
              return fetchEmergencyEvents_axios$(this.startIndex);
            }),
            tap(result => this.startIndex = result.startIndex),
            repeat({
              delay: () => {
                //LocalNotifications can only fire once per 9 minutes, per app when app inactivate
                // const delayDurantion = appStore.isActive ?  5 * 60 * 1000 :  8 * 60 * 1000;
                return of(0).pipe(delay(1 * 60 * 1000, asyncScheduler));
                // return of(0).pipe(delay(1 * 10 * 1000, asyncScheduler));
              }
            }),
            switchMap(() => {
              this.records = [...this.records, {seq: ++emergencyEventCount,  message: '测试突发事件' }];
              if (appStore.isActive) {
                return from(toastService.create({
                  header: '突发事件',
                  message: '测试突发事件',
                  duration: 5 * 1000,
                  position: 'top',
                  color: IonicPredefinedColors.Warning,
                  buttons: [{
                    icon: closeOutline,
                    side: 'end'
                  }],
                  animated: false,
                }));
              }
              if (appStore.localNotificationsPermissions) {
                return from(LocalNotifications.schedule({
                  notifications: [{
                    schedule: {
                      allowWhileIdle: true,
                    },
                    id: new Date().getTime(),
                    title: 'FG Notification',
                    body: 'FG:突发事件',
                    group: 'EmergencyEvents', // need setGroup
                  }]
                }));
              }
              return EMPTY;
            }),
            finalize(() => {
              this.fgCheckStarted = false;
            }),
            takeUntil(destroy$),
          ).subscribe();
        }
      },
      async enableBgCheck() {
        const appStore = useAppStore();
        if (!appStore.isNativePlatform) return ;
        if (!appStore.localNotificationsPermissions || this.bgCheckStarted) return ;


        this.bgCheckStarted = true;
        const status = await BackgroundFetch.configure({
          minimumFetchInterval: 15,
          stopOnTerminate: false,
          enableHeadless: true,
        }, async (taskId) => {
          // this.emgEventLogs = [];
          // this.emgEventLogs.push('@@@@@@@@@@@@@@@@');

          if (appStore.isActive) {
            BackgroundFetch.finish(taskId);
          }

          try {
            const response = await Http.post({
              url: `${appStore.baseUrl}/${YNAPI_SJCX.GetEmergencyEvents}`,
              // method: 'POST',
              headers: {
                ['content-type']: 'application/x-www-form-urlencoded',
                token: '',
              },
              connectTimeout: 8 * 1000,
              responseType: 'json',
              data: new URLSearchParams({startIndex: this.startIndex.toString(), recordName: ''})
            });

            if (response.status === 200) {
              this.startIndex = response.data.startIndex;
              this.records = [...this.records, {seq: ++emergencyEventCount,  message: '测试突发事件' }];
            }
          } catch(err) { 
            // notth
          }
   
          await LocalNotifications.schedule({
            notifications: [{
              schedule: {
                // allowWhileIdle: true,
                at: new Date(Date.now() + 1500 ), // in a minute
                repeats: false,
              },
              id: emergencyEventCount++,
              title: taskId,
              body: taskId,
              channelId: 'important_info_channel',
              ongoing: true,
            }]
          });
          BackgroundFetch.finish(taskId);
        }, async (taskId) => {
          // The OS has signalled that your remaining background-time has expired.
          // You must immediately complete your work and signal #finish.
          // [REQUIRED] Signal to the OS that your work is complete.
          // this.emgEventLogs.push('finishTask by timeout');
          BackgroundFetch.finish(taskId);
        });
        // Checking BackgroundFetch status:
        if (status !== BackgroundFetch.STATUS_AVAILABLE) {
          // Uh-oh:  we have a problem:
          if (status === BackgroundFetch.STATUS_DENIED) {
            alertController.create({message: 'The user explicitly disabled background behavior for this app or for the whole system.'}).then(x => x.present());
          } else if (status === BackgroundFetch.STATUS_RESTRICTED) {
            alertController.create({message: 'Background updates are unavailable and the user cannot enable them again.'}).then(x => x.present());
          }
          this.bgCheckStarted = false;
        } else {
          alertController.create({message: 'BackgroundFetch Start'}).then(x => x.present());
        }
        BackgroundFetch.scheduleTask({
          taskId: 'custom-task-id',  // <-- REQUIRED
          delay: 1 * 60 * 1000,              // <-- REQUIRED
          periodic: true            // <-- ONE-SHOT (default)
        });

      },
      // check() {
      //   if (!this.startCheck) {
      //     const appStore = useAppStore();
      //     // const userStore = useUserStore();
      //     this.$patch({
      //       startCheck: true
      //     });

      //     combineLatest([auth$, appState$]).pipe(
      //       switchMap(([x, y]) => {
      //         // use materialize wrap next/error/complete to next, so the of(x) will emit the next value that come from complete
      //         return !!x && !!y ? of(true).pipe(materialize()) : EMPTY;
      //       }),
      //       // use dematerialize unwrap the next to origin in which previous was complete, so the repeat treat the source was complete
      //       dematerialize(),
      //       delay(10 * 1000, asyncScheduler),
      //       switchMap(() => {
      //         return  httpService.post(YNAPI_SJCX.GetEmergencyEvents, {
      //           startIndex: this.startIndex,
      //           recordName: ''
      //         }, {headers: {errorSilent: true, skipMask: true}, });
      //       }),
      //       catchError(() => {
      //         // alertService.create({
      //         //   message: 'event check error'
      //         // });
      //         return of({data: null});
      //       }),
      //       map(response => {
      //         return response.data || {} as {result: any[], startIndex: number};
      //       }),
      //       tap(result => this.$patch({startIndex: result.startIndex})),
      //       repeat({
      //         delay: () => {
      //           //LocalNotifications can only fire once per 9 minutes, per app when app inactivate
      //           // const delayDurantion = appStore.isActive ?  5 * 60 * 1000 :  8 * 60 * 1000;
      //           return of(0).pipe(delay(5 * 60 * 1000, asyncScheduler));
      //           // return of(0).pipe(delay(1 * 10 * 1000, asyncScheduler));
      //         }
      //       }),
      //       switchMap(() => {
      //         this.$patch({
      //           records: [...this.records, {seq: ++emergencyEventCount,  message: '测试突发事件' }]
      //         });

      //         if (appStore.isActive) {
      //           return from(toastService.create({
      //             header: '突发事件',
      //             message: '测试突发事件',
      //             duration: 5 * 1000,
      //             position: 'top',
      //             color: IonicPredefinedColors.Warning,
      //             buttons: [{
      //               icon: closeOutline,
      //               side: 'end'
      //             }],
      //             animated: false,
      //             // icon?: string;
      //             // color?: Color;
      //             // mode?: Mode;
      //             // keyboardClose: boolean;
      //             // id?: string;
      //           }));
      //         }

      //         if (appStore.localNotificationsPermissions) {
      //           return from(LocalNotifications.schedule({
      //             notifications: [{
      //               schedule: {
      //                 allowWhileIdle: true,
      //               },
      //               id: new Date().getTime(),
      //               largeBody: 'Capacitor considers each platform project a source asset instead of a build time asset. That means, Capacitor wants you to keep the platform source code in the repository, unlike Cordova which always assumes that you will generate the platform code on build time',
      //               title: 'Test Notification',
      //               body: '测试突发事件',
      //               group: 'EmergencyEvents', // need setGroup
      //             }]
      //           }));
      //         }

      //         return EMPTY;



      //       }),
      //       takeUntil(destroy$),
      //     ).subscribe();
      //   }
      // },
      reset() {
        destroy$.next(true);
        this.$reset();
      },
      destroy() {
        destroy$.next(true);
        destroy$.complete();

        // fix: pinia.state will cache state even the store instance was remove by call self dispose;
        // manual call reset make cahce state backto inital status; more detail see the state fn on below;
        // call the dispose first, to remove all subscribe which may invoke by $reset state;
        this.$dispose();
        this.$reset();
      },
    }
  })();
}
