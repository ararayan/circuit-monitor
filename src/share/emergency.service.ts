
import { IonicPredefinedColors } from "@/model";
import { appState$, useAppStore } from "@/share/hooks/use-app.store";
import { httpService, YNAPI_SJCX } from "@/share/http";
import { toastService } from "@/share/toast.service";
import { Http } from "@capacitor-community/http";
import { LocalNotifications } from '@capacitor/local-notifications';
import { alertController } from "@ionic/core";
import { BackgroundFetch } from "@transistorsoft/capacitor-background-fetch";
import { closeOutline } from 'ionicons/icons';
import { asyncScheduler, combineLatest, EMPTY, from, of, Subject } from "rxjs";
import { catchError, delay, dematerialize, filter, finalize, map, materialize, repeat, switchMap, takeUntil, tap } from "rxjs/operators";
import { cacheService, StorageType } from "./cache.service";
import { auth$ } from "./user";

const YN_IsStartBgCheckKey = '__YN_isStartBgCheck__';
const YN_StartBgCheckIndexKey = '__YN_StartBgCheckIndex__'; //???

export interface CheckEmergencyEventsResponseData {
  events: any[];
  startIndex: number;
}

enum DestroyFlag {
  FG = 'fg',
  BG = 'bg',
  All = 'all'
}

let fgEmergencyEventCount = 0;
export let bgEmergencyEventCount = 0;

class EmergencyEventsService {
  private isStartFgCheck = false;
  private isStartBgCheck: boolean = cacheService.get(YN_IsStartBgCheckKey) || false;
  private startIndex: string = (cacheService.get(YN_StartBgCheckIndexKey) || 0).toString();
  private records: any[] = [];
  private destroy$ = new Subject<DestroyFlag>();
  fgHintMsg = '';
  startFgCheck() {
    if (!this.isStartFgCheck) {
      const appStore = useAppStore();
      this.isStartFgCheck = true;
      combineLatest([auth$, appState$]).pipe(
        switchMap(([x, y]) => {
          // use materialize wrap next/error/complete to next, so the of(x) will emit the next value that come from complete
          return !!x && !!y ? of(true).pipe(materialize()) : EMPTY;
        }),
        // use dematerialize unwrap the next to origin in which previous was complete, so the repeat treat the source was complete
        dematerialize(),
        delay(10 * 1000, asyncScheduler),
        switchMap(() => {
          return httpService.post<CheckEmergencyEventsResponseData>(YNAPI_SJCX.GetEmergencyEvents, {
            startIndex: this.startIndex,
            recordName: ''
          }, { headers: { errorSilent: true, skipMask: true }, });
        }),
        catchError(() => of({ data: null })),
        map(response => response.data || { events: [], startIndex: this.startIndex }),
        tap(result => this.startIndex = result.startIndex.toString() ),
        repeat({
          delay: () => {
            //LocalNotifications can only fire once per 9 minutes, per app when app inactivate
            // const delayDurantion = appStore.isActive ?  5 * 60 * 1000 :  8 * 60 * 1000;
            return of(0).pipe(delay(1 * 60 * 1000, asyncScheduler));
            // return of(0).pipe(delay(1 * 10 * 1000, asyncScheduler));
          }
        }),
        switchMap(() => {
          this.records = [...this.records, { seq: ++fgEmergencyEventCount, message: 'fg: 测试突发事件' }];
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
                largeBody: 'Capacitor considers each platform project a source asset instead of a build time asset. That means, Capacitor wants you to keep the platform source code in the repository, unlike Cordova which always assumes that you will generate the platform code on build time',
                title: 'Test Notification',
                body:  `fg: 测试突发事件${fgEmergencyEventCount}`,
                group: 'EmergencyEvents', // need setGroup
              }]
            }));
          }
          return EMPTY;
        }),
        finalize(() => {
          this.fgHintMsg = `fg finalize in ${new Date().toTimeString().slice(0, 8)}`;
        }),
        takeUntil(this.destroy$.pipe(filter(x => x === DestroyFlag.FG))),
      ).subscribe();
    }
  }
  async startBgCheck(url: string) {
    const appStore = useAppStore();
    if (!appStore.localNotificationsPermissions && !this.isStartBgCheck) return;
    this.isStartBgCheck = true;
    cacheService.set(YN_IsStartBgCheckKey, true, StorageType.Persistent);

    alertController.create({ message: 'configure BackgroundFetch Events!!!' }).then(x => x.present());

    const status = await BackgroundFetch.configure({
      minimumFetchInterval: 15,
      stopOnTerminate: false,
      enableHeadless: true,
      forceAlarmManager: true,
    }, async (taskId) => {
      bgEmergencyEventCount++;

      try {
        const response = await Http.post({
          url,
          headers: {
            ['content-type']: 'application/x-www-form-urlencoded',
            token: '',
          },
          connectTimeout: 5 * 1000,
          responseType: 'json',
          data: new URLSearchParams({ startIndex: this.startIndex, recordName: '' })
        });

        if (response.status === 200) {
          // successful
          this.startIndex = response.data?.startIndex?.toString() || '0';
          cacheService.set(YN_StartBgCheckIndexKey, this.startIndex, StorageType.Persistent);
          this.records = [...this.records, { seq: bgEmergencyEventCount, message: 'bg: 测试突发事件' }];
        }
      } catch (err) {
        // todo
      }

      const notifyId = bgEmergencyEventCount;
      await LocalNotifications.schedule({
        notifications: [{
          schedule: {
            allowWhileIdle: true,
            at: new Date(Date.now() + 1000), // in a minute
            repeats: false,
          },
          id: notifyId,
          title: `${taskId} ${notifyId}`,
          body: `${taskId} bg: 测试突发事件${notifyId}`,
          channelId: 'important_info_channel',
          ongoing: true,
          autoCancel: false,
        }]
      });
      BackgroundFetch.finish(taskId);
    }, async (taskId) => {
      // The OS has signalled that your remaining background-time has expired.
      // You must immediately complete your work and signal #finish.
      // [REQUIRED] Signal to the OS that your work is complete.
      console.log('xxx: BackgroundFetch Timeout');
      BackgroundFetch.finish(taskId);
    });
    // Checking BackgroundFetch status:
    if (status !== BackgroundFetch.STATUS_AVAILABLE) {
      // Uh-oh:  we have a problem:
      if (status === BackgroundFetch.STATUS_DENIED) {
        console.log('The user explicitly disabled background behavior for this app or for the whole system.');
      } else if (status === BackgroundFetch.STATUS_RESTRICTED) {
        console.log('Background updates are unavailable and the user cannot enable them again.');
      }
    } else {
      alertController.create({ message: 'Curr BackgroundFetch Start' }).then(x => x.present());
    }
  }
  stopFgCheck() {
    this.destroy$.next(DestroyFlag.FG);
  }
  // private _fetchEvents$() {
  //   return httpService.post<CheckEmergencyEventsResponseData>(YNAPI_SJCX.GetEmergencyEvents, {
  //     startIndex: this.startIndex,
  //     recordName: ''
  //   }, { headers: { errorSilent: true, skipMask: true }, }).pipe(
  //     catchError(() => of({ data: null })),
  //     map(response => response.data || { events: [], startIndex: this.startIndex }),
  //     tap(result => this.startIndex = result.startIndex),
  //     switchMap(() => {
  //       this.records = [...this.records, { seq: ++emergencyEventCount, message: '测试突发事件' }];
  //       return from(LocalNotifications.schedule({
  //         notifications: [{
  //           schedule: {
  //             allowWhileIdle: true,
  //           },
  //           id: new Date().getTime(),
  //           largeBody: 'Capacitor considers each platform project a source asset instead of a build time asset. That means, Capacitor wants you to keep the platform source code in the repository, unlike Cordova which always assumes that you will generate the platform code on build time',
  //           title: 'Test Notification',
  //           body: '测试突发事件',
  //           // group: 'EmergencyEvents', // need setGroup
  //         }]
  //       }));
  //     }),
  //   );
  // }
}

export const emergencyEventsService = new EmergencyEventsService();
