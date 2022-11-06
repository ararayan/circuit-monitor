
import { IonicPredefinedColors } from "@/model";
import { appState$, useAppStore } from "@/share/hooks/use-app.store";
import { httpService, YNAPI_SJCX } from "@/share/http";
import { toastService } from "@/share/toast.service";
import { Http } from "@capacitor-community/http";
import { LocalNotifications } from '@capacitor/local-notifications';
import { BackgroundFetch } from "@transistorsoft/capacitor-background-fetch";
import { closeOutline } from 'ionicons/icons';
import { asyncScheduler, combineLatest, EMPTY, from, of, Subject } from "rxjs";
import { catchError, delay, dematerialize, filter, map, materialize, repeat, switchMap, takeUntil, tap } from "rxjs/operators";
import { cacheService, ICacheService, StorageType, YNCacheKey } from "./cache.service";
import { ControlStatusCode, ControlStatusCodeTexts } from "./entity/data/operations";
import { EventRecord } from "./entity/entity.service";
import { auth$ } from "./user";

export interface CheckEmergencyEventsResponseData {
  result: EventRecord[];
  startIndex: number;
}

enum DestroyFlag {
  FG = 'fg',
  BG = 'bg',
  All = 'all'
}




export class EmergencyEventsService {
  private isStartFgCheck = false;
  // private isStartBgCheck = false;
  private startIndex = '0';
  private records: any[] = [];
  private destroy$ = new Subject<DestroyFlag>();
  private static _instance: EmergencyEventsService = null as any as EmergencyEventsService;
  debugEETotal = 0;
  debugEE = 0;
  constructor(cacheService: ICacheService) {
    //alertController.create({ message: `cache is loaded:  ${cacheService.isLoaded}, cache.IsStartBgCheck: ${cacheService.get(YNCacheKey.IsStartBgCheck)} `}).then(x => x.present());
    // this.isStartBgCheck = cacheService.get(YNCacheKey.IsStartBgCheck) || false;
    this.startIndex = (cacheService.get(YNCacheKey.StartBgCheckIndex) || 0).toString();
    // this.debugEE = cacheService.get(YNCacheKey.StartBgCheckIndex) || 0
  }
  static getInstance(cacheService: ICacheService) {
    if (!EmergencyEventsService._instance) {
      EmergencyEventsService._instance = new EmergencyEventsService(cacheService);
    }
    return this._instance;
  }
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
        delay(1 * 1000, asyncScheduler),
        switchMap(() => {
          return httpService.post<CheckEmergencyEventsResponseData>(YNAPI_SJCX.GetEmergencyEvents, {
            startIndex: this.startIndex,
            recordName: ''
          }, { headers: { errorSilent: true, skipMask: true }, });
        }),
        catchError(() => of({ data: null })),
        map(response => response.data || { result: [] as EventRecord[], startIndex: Number(this.startIndex) } as CheckEmergencyEventsResponseData),
        tap(result => {
          this.startIndex = result.startIndex.toString();
          cacheService.set(YNCacheKey.StartBgCheckIndex, this.startIndex, StorageType.Persistent);
        } ),
        repeat({
          delay: () => {
            //LocalNotifications can only fire once per 9 minutes, per app when app inactivate
            // const delayDurantion = appStore.isActive ?  5 * 60 * 1000 :  8 * 60 * 1000;
            return of(0).pipe(delay(1 * 4 * 1000, asyncScheduler));
            // return of(0).pipe(delay(1 * 10 * 1000, asyncScheduler));
          }
        }),
        switchMap(checked => {
          if (checked?.result?.length) { 
            this.records = [...this.records, ...checked.result];
            const message = checked.result.reduce((acc, event) => {
              return `${acc}#${event.pos} - ${ControlStatusCodeTexts[event.state as ControlStatusCode]}; `;
            }, '');
            if (appStore.isActive) {
              return from(toastService.create({
                header: '突发事件',
                message,
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
                  id: new Date().getTime(),
                  title: '衍能科技',
                  body: `${checked.result}宗突发事件。`,
                  largeBody: message,
                  channelId: 'important_info_channel',
                  autoCancel: false,
                  group: 'emergencyEvents',
                  groupSummary: true,
                  summaryText: '衍能科技',
                  schedule: {
                    allowWhileIdle: true,
                  },
                }]
              }));
            }
          }
        
          return EMPTY;
        }),
        // finalize(() => {}),
        takeUntil(this.destroy$.pipe(filter(x => x === DestroyFlag.FG))),
      ).subscribe();
    }
  }
  async startBgCheck(url: string) {
    const appStore = useAppStore();
    if (!appStore.localNotificationsPermissions) return;
    // this.isStartBgCheck = true;
    // cacheService.set(YNCacheKey.IsStartBgCheck, true, StorageType.Persistent);
   
    // alertController.create({ message: 'configure BackgroundFetch Events!!!' }).then(x => x.present());

    const status = await BackgroundFetch.configure({
      minimumFetchInterval: 15,
      enableHeadless: true,
      stopOnTerminate: false,
      startOnBoot: true,
      forceAlarmManager: false,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE,
      requiresBatteryNotLow: false,
      requiresCharging: false,
      requiresDeviceIdle: false,
      requiresStorageNotLow: false
    }, async (taskId) => {

      this.debugEETotal++;

      if (appStore.isActive) {
        BackgroundFetch.finish(taskId);
        return ;
      }

      this.debugEE++;

      try {
        const response = await Http.post({
          url,
          headers: {
            ['content-type']: 'application/x-www-form-urlencoded',
            token: '',
          },
          connectTimeout: 12 * 1000,
          responseType: 'json',
          data: new URLSearchParams({ startIndex: this.startIndex, recordName: '' })
        });

        if (response.status === 200) {
          // successful
          const emergencyEventsResponse: CheckEmergencyEventsResponseData = response.data;
          const result = emergencyEventsResponse?.result || [];
          if ( emergencyEventsResponse?.startIndex !== undefined && this.startIndex !== emergencyEventsResponse?.startIndex?.toString() ) {
            this.startIndex = emergencyEventsResponse.startIndex?.toString();
            cacheService.set(YNCacheKey.StartBgCheckIndex, this.startIndex, StorageType.Persistent);
            await cacheService.save();
          }
        
          if (result.length) {
            this.records = [...this.records, ...result];
          }

          const message = result.reduce((acc, event) => {
            return `${acc}#${event.pos} - ${ControlStatusCodeTexts[event.state as ControlStatusCode]}; `;
          }, '');
          await LocalNotifications.schedule({
            notifications: [{
              id: new Date().getTime(),
              title: `衍能科技`,
              body: `${result.length}宗突发事件。`,
              largeBody: message,
              channelId: 'important_info_channel',
              autoCancel: false,
              group: 'emergencyEvents',
              groupSummary: true,
              summaryText: '衍能科技',
              schedule: {
                allowWhileIdle: true,
                // at: new Date(Date.now() + 1500), // in a minute
                // repeats: false,
              },
            }]
          });
        } else {
          // http call failure
        }
        
      } catch (err: any) {
        // http error, usauly time out
        const nextStatus = await BackgroundFetch.status();
        await LocalNotifications.schedule({
          notifications: [{
            id: new Date().getTime(),
            title: `衍能科技 Error`,
            body: `error: ${err.message}; AVAILABLE: ${nextStatus === BackgroundFetch.STATUS_AVAILABLE}`,
            channelId: 'important_info_channel',
            autoCancel: false,
            group: 'emergencyEvents',
            groupSummary: true,
            summaryText: '衍能科技',
            schedule: {
              allowWhileIdle: true,
            },
          }]
        });
      }


      BackgroundFetch.finish(taskId);
    }, async (taskId) => {
      // The OS has signalled that your remaining background-time has expired.
      // You must immediately complete your work and signal #finish.
      // [REQUIRED] Signal to the OS that your work is complete.
      console.log('xxx: BackgroundFetch Timeout');
      const nextStatus = await BackgroundFetch.status();
      await LocalNotifications.schedule({
        notifications: [{
          id: new Date().getTime(),
          title: `BG Timeout`,
          body: `BG Fetch Timeout!! AVAILABLE: ${nextStatus === BackgroundFetch.STATUS_AVAILABLE}`,
          channelId: 'important_info_channel',
          autoCancel: false,
          group: 'emergencyEvents',
          groupSummary: true,
          summaryText: '衍能科技',
          schedule: {
            allowWhileIdle: true,
            // at: new Date(Date.now() + 1500), // in a minute
            // repeats: false,
          },
        }]
      });
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
      // alertController.create({ message: 'Curr BackgroundFetch Start' }).then(x => x.present());
    }
  }
  stopFgCheck() {
    this.destroy$.next(DestroyFlag.FG);
  }
}

