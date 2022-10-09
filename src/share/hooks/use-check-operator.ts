import { IonicPredefinedColors } from "@/model";
import { LocalNotifications } from "@capacitor/local-notifications";
import { AxiosRequestConfig } from "axios";
import { closeOutline } from 'ionicons/icons';
import { BehaviorSubject, merge, of, Subject } from "rxjs";
import { catchError, delay, filter, finalize, map, mergeMap, repeat, scan, shareReplay, switchMap, take, takeUntil } from 'rxjs/operators';
import { Entities, OperatorType, YxCheckResponse } from "../entity";
import { httpService } from "../http";
import { toastService } from "../toast.service";
import { useAppStore } from "./use-app.store";

export interface OperatorCheckListItem {
  /**
   * general format with: entity + recordId + operatorType
   */
  id: string;
  // entity: Entities;
  // recordId: string;
  // operatorType: OperatorType;
  /**
   * url for check, YNAPI_KZCZ.CheckControlResult or YNAPI_KZCZ.CheckControlResult
   */
  url: string;
  /**
   * operator check params, etc:
   *  controlType: OperatorType.RemoteSelect,
   *  yxIds: data.yxIds,
   *  action: data.action,
   */
  payload: {
    controlType: OperatorType,
    kfkhID: string,
    action: string;
    startIndex: number;
  };
  /**
   * check result valid callback;
   */
  validCallback: (...args: any[]) => boolean;
  /**
   * check retry count when error, default is 5
   */
  retryCount: number;
  /**
   * interval to check, default was 5 * 1000
   */
  intervalTime: number;
  /**
   * increment time in every retry;  default is 0
   */
  incrementIntervalTime: number;
  notifyInfo?: {
    success: { title: string; message: string},
    failure: { title: string; message: string},
  },
  style?: OperatorCheckNotifyStyle
}

export enum OperatorCheckNotifyStyle {
  Default = 'default',
  Custom = 'custom',
}

let idCount = 0;
export function getCheckItemId(entityName: Entities, recordId: string, operator: OperatorType) {
  return `${entityName}_${recordId}_${operator}@${++idCount}`;
}

const skipMaskConfig: Partial<AxiosRequestConfig> = {headers: {skipMask: true}};
class CheckControlResultService {
  private _aliveItems = new Set<string>();
  private _checkItemNotifyStyle: Record<OperatorCheckNotifyStyle, Set<string>> = {
    [OperatorCheckNotifyStyle.Default]: new Set<string>(),
    [OperatorCheckNotifyStyle.Custom]: new Set<string>()
  };
  private _destory$ = new Subject<void>();
  // private _pause$ = new BehaviorSubject<boolean>(false);
  private _start$ = new BehaviorSubject<OperatorCheckListItem | null>(null);
  private _end$ = new BehaviorSubject<string>('');

  private _check$ = this._start$.pipe(
    filter(x => !!x),
    mergeMap(x => {
      const item = x as any as OperatorCheckListItem;
      this._aliveItems.add(item.id);
      this._checkItemNotifyStyle[item.style || OperatorCheckNotifyStyle.Default].add(item.id);

      let retryCount = item.retryCount;
      return of(null).pipe(
        // delayWhen(() => this._pause$.pipe(filter(x => !x))),
        switchMap(() => {
          return httpService.post<YxCheckResponse>(item.url, item.payload, skipMaskConfig);
        }),
        catchError(err => {
          console.error(err.message);
          return of({data: {hasNewControlResult: 0, result: 0}});
        }),
        // repeat must been after catchError, so the error was convert to completed, and repeat still alive, otherwise, need use retry catch the error;
        repeat({
          count: retryCount + 1,
          delay: () => {
            retryCount--;
            const incrementFactor = item.retryCount - retryCount - 1;
            return of(0).pipe(delay(item.intervalTime + item.incrementIntervalTime * incrementFactor));
          }
        }),
        filter(result => {
          if (item.validCallback(result.data) || !retryCount) {
            return true;
          } 
          return false;
        }),
        map(result => {
          return { id: item.id, result: item.validCallback(result.data), item};
        }),
        take(1),
        takeUntil(merge(this._end$.pipe(filter(id => item.id === id)), this._destory$)),
        finalize(() =>  {
          this._aliveItems.delete(item.id);
          this._checkItemNotifyStyle[OperatorCheckNotifyStyle.Default].delete(item.id);
          this._checkItemNotifyStyle[OperatorCheckNotifyStyle.Custom].delete(item.id);
        }),
      );   
    }),
    shareReplay(1),
  );
  private _accCheck$ = this._check$.pipe(
    scan((acc, curr) => {
      acc = {...acc, [curr.id]: curr.result};
      return acc;
    }, {} as Record<string, boolean>),
    shareReplay(1),
  );
  constructor() {
    this._check$.pipe(
      takeUntil(this._destory$),
    ).subscribe(check => {
      if (check.item.notifyInfo) {
        this.resultNotifyHandle(check.id, check.result, check.item.notifyInfo);
      }
    });
  }
  private resultNotifyHandle (itemId: string, checkResult: any, notifyInfo: Required<OperatorCheckListItem>['notifyInfo']) {
    const appStore = useAppStore();
    if (appStore.isActive || !appStore.localNotificationsPermissions) {
      if (this._checkItemNotifyStyle[OperatorCheckNotifyStyle.Default].has(itemId)) {
        toastService.create({
          id: itemId,
          header: checkResult ? notifyInfo.success.title : notifyInfo.failure.title,
          message: checkResult ? notifyInfo.success.message : notifyInfo.failure.message,
          duration: 5 * 1000,
          position: 'top',
          color: checkResult ? IonicPredefinedColors.Success : IonicPredefinedColors.Warning,
          buttons: [{
            icon: closeOutline,
            side: 'end'
          }], 
          animated: false,       
        });
      }
    } else{
      LocalNotifications.schedule({
        notifications: [{
          schedule: {
            allowWhileIdle: true,
          },
          id: new Date().getTime(),
          // largeBody: 'Capacitor considers each platform project a source asset instead of a build time asset. That means, Capacitor wants you to keep the platform source code in the repository, unlike Cordova which always assumes that you will generate the platform code on build time',
          title: checkResult ? notifyInfo.success.title : notifyInfo.failure.title,
          body: checkResult ? notifyInfo.success.message : notifyInfo.failure.message,
          group: itemId
        }]
      });
    }
  }
  addCheckItem(item: Omit<OperatorCheckListItem, 'validCallback'>, validCallback: (result: any) => boolean) {
    const copy: OperatorCheckListItem = JSON.parse(JSON.stringify(item));
    copy.validCallback = validCallback;
    this._start$.next(copy);
  }
  removeCheckItem(itemId: string) {
    this._end$.next(itemId);
  }
  setNotifyStyle(itemId: string, style: OperatorCheckNotifyStyle) {
    if (this._aliveItems.has(itemId)) {
      this._checkItemNotifyStyle[style].add(itemId);
    }
  }
  getCheckResult$(itemId: string) {
    return this._accCheck$.pipe(
      filter(x => x[itemId] !== undefined),
      map(x => x[itemId]),
      takeUntil(merge(this._destory$, this._end$.pipe(filter(id => id === itemId))))
    );
  }
  destroy() {
    this._checkItemNotifyStyle = null as any as Record<OperatorCheckNotifyStyle, Set<string>> ;
    this._aliveItems = null as any as Set<string>;
    this._start$.complete();
    this._end$.complete();
    this._destory$.next();
    this._destory$.complete();
  }
}

export const checkControlResultService = new CheckControlResultService();
