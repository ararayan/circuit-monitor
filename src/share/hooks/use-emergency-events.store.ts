import { useAppStore } from "@/share/hooks/use-app.store";
import { httpService, YNAPI_SJCX } from "@/share/http";
import { toastService } from "@/share/toast.service";
import { LocalNotifications } from '@capacitor/local-notifications';
import { defineStore } from "pinia";
import { EMPTY, from, of, Subject } from "rxjs";
import { catchError, delay, map, repeat, switchMap, takeUntil, tap } from "rxjs/operators";

function formatDateToEmergencyParams (date: Date) {
  const firstPart = `${date.getFullYear()}/${date.getMonth()}/${ date.getDate()}`;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const secondsPart = `${hours >= 10 ? '' + hours : '0' + hours}:${minutes >= 10 ? '' + minutes : '0' + minutes }:${seconds >= 10 ? '' + seconds : '0' + seconds }`;
  return `${firstPart} ${secondsPart}`;
}

const destory$ = new Subject<boolean>();

export function useEmergencyEvents() {
  return defineStore('emergencyEvents', {
    state: () => {
      const initialState = {
        startCheck: false,
        checkDateTime: '',
        records: [] as string[],
      };
      return { ...initialState };
    },
    actions: {
      check() {
        if (!this.startCheck) {
          const appStore = useAppStore();
          this.$patch({
            startCheck: true
          });
          
          of(0).pipe(
            switchMap(() => {
              return  httpService.post(YNAPI_SJCX.GetEmergencyEvents, {
                validateDate: this.checkDateTime || formatDateToEmergencyParams(new Date()),
                recordName: ''
              }, {headers: {errorSilent: true}, });
            }),
            catchError(() => {
              // alertService.create({
              //   message: 'event check error'
              // });
              return of({data: null});
            }),
            map(response => {
              return response.data || {} as {result: any[], validateDate: string};
            }),
            tap(result => this.$patch({checkDateTime: result.validateDate})),
            repeat({
              delay: () => {
                //LocalNotifications can only fire once per 9 minutes, per app when app inactivate
                // return of(0).pipe(delay(this.isActive ?  9 * 60 * 1000 : 20 * 1000));
                return of(0).pipe(delay(20 * 1000));
              }
            }),
            switchMap(() => {
              if (appStore.isActive) {
                return from(toastService.create({
                  header: '突发事件',
                  message: 'Capacitor considers each platform project a source asset instead of a build time asset. That means, Capacitor wants you to keep the platform source code in the repository, unlike Cordova which always assumes that you will generate the platform code on build time',
                  duration: 3 * 1000,
                  position: 'top',
                  animated: true,
                  // icon?: string;
                  // color?: Color;
                  // mode?: Mode;
                  // keyboardClose: boolean;
                  // id?: string;
                }));
              }

              if (!appStore.localNotificationsPermissions) {
                this.$patch({
                  records: [...this.records, 'pending msg']
                });
                return EMPTY;
              }

              return from(LocalNotifications.schedule({
                notifications: [{
                  schedule: {
                    allowWhileIdle: true,
                  },
                  id: new Date().getTime(),
                  largeBody: 'Capacitor considers each platform project a source asset instead of a build time asset. That means, Capacitor wants you to keep the platform source code in the repository, unlike Cordova which always assumes that you will generate the platform code on build time',
                  title: 'Test Notification',
                  body: '$$$$ LLL',
                  group: 'EmergencyEvents'
                }]
              }));

            }),
            takeUntil(destory$),
          ).subscribe();

        }
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
