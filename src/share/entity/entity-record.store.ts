import { AxiosRequestConfig } from "axios";
import { defineStore, MutationType } from "pinia";
import { asyncScheduler, EMPTY, Observable, of, Subject, throwError } from "rxjs";
import { catchError, delay, dematerialize, finalize, map, materialize, repeat, switchMap, take, takeUntil, takeWhile, tap } from "rxjs/operators";
import { DataStatus } from "../data.meta";
import { appState$ } from "../hooks/use-app.store";
import { checkControlResultService, getCheckItemId, OperatorCheckNotifyStyle } from "../hooks/use-check-operator";
import { httpService, YNAPI_KZCZ } from "../http";
import { loadingService } from "../loading.service";
import { ControlStatusCode, ControlStatusCodeIds, ControlStatusCodeTexts } from "./data/operations";
import { OperatorStatus, OperatorType, YxOperatorParams, YxOperatorResponse } from "./entity-edit-form.store";
import { EntityStoreFeature, getEntityRecordStoreId } from "./entity-store-id";
import { FixedModuleRecord, getRecords } from './entity.service';
import { Entities, EntityRecord, EntityRecordAlias } from "./entity.types";



export interface EntityRecordInitialState {
  entityName: string;
  records: EntityRecord[];
  pagination: {
    current: number;
    pageSize: number;
  },
  meta: {
    records: DataStatus;
  },
  hasPagination: boolean;
  toastMsg: string;
  startSyncRecrod: boolean;
  syncFields: string[];
}

export enum ToastType {
  Success = 'success',
  Failure = 'failure',
  Empty = 'empty',
}

export function useEntityRecordsStore<T extends EntityRecord >(entityName: Entities, tabId?: string ) {
  const storeId = getEntityRecordStoreId(entityName, EntityStoreFeature.Record, tabId);
  const destory$ = new Subject<boolean>();
  return defineStore(storeId, {
    state: () => {
      const initialState = {
        entityName: '',
        records: [] as T[],
        isInited: false,
        pagination: {
          current: 1,
          pageSize: 20
        },
        meta: {
          records: DataStatus.Unloaded,
        },
        hasPagination: false,
        toastMsg: '',
        toastType: ToastType.Empty,
        startSyncRecrod: false,
        syncFields: [] as string[],
        checkItemIds: new Set<string>(),
      };
      return { ...initialState, entityName };
    },
    getters: {
      range: (state) => {
        const startIndex = 0;
        const endIndex = state.pagination.current * state.pagination.pageSize;
        return {startIndex, endIndex};
      },
      currRange: (state) => {
        const startIndex = (state.pagination.current - 1) * state.pagination.pageSize;
        const endIndex = state.pagination.current * state.pagination.pageSize;
        return {startIndex, endIndex};
      },
      getRecord: (state) => (id: string) => state.records.find(r => r.id.toString() === id)
    },
    actions: {
      initState(options?: Partial<EntityRecordInitialState>) {
        if (options && Object.keys(options).length) {
          this.$patch(options as any);
        }
      },
      setSyncFields(fields: string[]) {
        this.$patch({
          syncFields: fields
        });
      },
      setHasPagination(hasPagination: boolean) {
        this.$patch({
          hasPagination: hasPagination
        });
      },
      getRecords(entityName: Entities, params: { criteria?: Record<string, any>, isInit?: boolean}, axionConfig?: AxiosRequestConfig) {
        const { criteria, isInit } = params;
        if (isInit && this.hasPagination) {
          this.$patch({
            records: [],
            pagination: {
              current: 0,
              pageSize: 20,
            },
            meta: {
              records: DataStatus.Loading
            }
          });
        } else if (this.hasPagination) {
          this.$patch({
            meta: {
              records: DataStatus.Loading
            }
          });
        } else {
          this.$patch({
            records: [],
            meta: {
              records: DataStatus.Loading
            }
          });
        }
        const queryPageIndex = isInit ? 1 : this.pagination.current + 1;
        const postData = this.hasPagination 
          ? { ...criteria, startIndex: (queryPageIndex - 1) * this.pagination.pageSize, endIndex: queryPageIndex * this.pagination.pageSize }
          : { ...criteria };
        getRecords(entityName, postData, axionConfig).pipe(
          catchError(() => {
            this.$patch({
              meta: {
                records: DataStatus.Error,
              },
            });
            return EMPTY;
          }),
          takeUntil(destory$)
        ).subscribe(result => {

          if (isInit) {
            const patchInfo = {
              records: [...this.records, ...(result || [])],
              pagination: {
                current: queryPageIndex
              },
              meta: {
                records: DataStatus.Loaded
              }
            };
            this.$patch({
              ...patchInfo,
              isInited: true,
            });
          }else {
            if (result.length) {
              this.$patch({
                records: [...this.records, ...(result || [])],
                pagination: {
                  current: queryPageIndex
                },
                meta: {
                  records: DataStatus.Loaded
                }
              });
            }else {
              this.$patch({
                meta: {
                  records: DataStatus.Loaded
                }
              });
            }
          }

        });
      },
      startRecordsCheck(params?: Record<string, any>, intervalTime = 3000) {
        if (!this.startSyncRecrod && this.syncFields.length > 0) {
          const checkParams = params || {};
          // let maxErrorCount = 5;
          const skipMaskConfig: Partial<AxiosRequestConfig> = {headers: {skipMask: true}};
          this.$patch({
            startSyncRecrod: true
          });
          appState$.pipe(
            delay(1 * 1000, asyncScheduler),
            takeWhile(() => this.isInited),
            switchMap(x => {
              // use materialize wrap next/error/complete to next, so the of(0) will emit the next value that come from complete
              return x ? of(0).pipe(materialize()) : EMPTY;
            }),
            // use dematerialize unwrap the next to origin in which previous was complete, so the repeat treat the source was complete
            dematerialize(),
            switchMap(() => {
              const postData = {
                ...checkParams,
                ...(this.hasPagination ? this.range : {}),
              };
              return (getRecords(entityName, postData, skipMaskConfig) as Observable<EntityRecordAlias<FixedModuleRecord>[]>).pipe(
                map(response => {
                  const dataList = response || [];
                  const dataInfos = dataList.reduce((acc, item) => {
                    acc[item.id] = item;
                    return acc;
                  }, {} as Record<string, any>);
                  return {info: dataInfos, list: dataList};
                }),
                map(({info, list}) => {
                  const isChanged = this.records.some(record => {
                    return this.syncFields.some(field => {
                      return record[field] !== info[record.id]?.[field];
                    });
                  });
                  return {info, list, isChanged};
                })
              );
            }),
            catchError(err => {
              // maxErrorCount--;
              // console.error(err.message);
              // if (!maxErrorCount) { 
              //   return throwError(() => err);
              // }
              // not stop the check, may network offline
              return of({} as Record<string, any>);
            }),
            repeat({
              delay: () => {
                return of(0).pipe(delay(intervalTime, asyncScheduler));
              }
            }),
            takeUntil(destory$),
          ).subscribe({
            next: (result) => {
              const {list, isChanged} = result as any;
              if (isChanged) {
                // when the checkReponseRecords.length < this.records.length
                // scenario: start check -> load data -> load new data and add to records -> check response => checkResponseRecords.length < this.records.length
                // when the checkReponseREcords.length > this.records.length
                // 1. switch tab not clear check ob, this was bug if it ocurrs!
                // 2. the server was not any records in inited, then add the record in server before the check request emit to server; the code was cover, direct cover the check list to records
                let newRecords = list;
                if (list.length !== this.records.length) {
                  newRecords = [...list, ...this.records.slice(list.length)] as typeof this.records;
                }
                this.$patch({
                  records: newRecords
                });
              }
            },
            complete: () => {
              this.$patch({
                startSyncRecrod: false
              });
            },
            error: () => {
              this.$patch({
                startSyncRecrod: false
              });
            },
          });
        }
      },
      requestExcute(data: YxOperatorParams) {
        this.$patch({
          toastMsg: '',
          toastType: ToastType.Empty,
        });
        const skipMaskConfig: Partial<AxiosRequestConfig> = {headers: {skipMask: true}};
        loadingService.show({
          message: '遥控执行中，请等候...'
        });
        httpService.post<YxOperatorResponse>(YNAPI_KZCZ.RemoteExcute, data, skipMaskConfig).pipe(
          tap(() =>  loadingService.hide()),
          switchMap(response => {
            const result = response.data || {};
            const checkId = getCheckItemId(entityName, data.id, OperatorType.RemoteExcute);
            if (result.isYxEffect && result.sendActionSuccess) {
              this.checkItemIds.add(checkId);
              checkControlResultService.addCheckItem({
                id: checkId,
                url: YNAPI_KZCZ.CheckControlResult,
                payload: {
                  controlType: OperatorType.RemoteExcute,
                  kfkhID: data[ControlStatusCodeIds[data.action as ControlStatusCode.Fen | ControlStatusCode.He]],
                  action: data.action,
                  startIndex: result.startIndex,
                },
                retryCount: 7,
                intervalTime: 1 * 1000,
                incrementIntervalTime: 2 * 1000,
                notifyInfo: {
                  success: {
                    title: '遥控执行成功',
                    message: `遥信ID: ${data.yxIds}; 操作：${ControlStatusCodeTexts[data.action as ControlStatusCode]};`,
                  },
                  failure: {
                    title: '遥控执行失败',
                    message: `遥信ID: ${data.yxIds}; 操作：${ControlStatusCodeTexts[data.action as ControlStatusCode]};`,
                  }
                },
                style: OperatorCheckNotifyStyle.Custom 
              }, (checkResult) => {
                return checkResult.hasNewControlResult === 1 && checkResult.result === 1;
              });
              return checkControlResultService.getCheckResult$(checkId).pipe(
                finalize(() => {
                  this.checkItemIds.delete(checkId);
                })
              ); 
            }
            this.$patch({
              toastMsg: '遥控执行失败, 请稍候重试.',
              toastType: ToastType.Failure,
            });
            return EMPTY;
          }),
          tap(checkResult => {
            if (checkResult) {
              this.$patch({
                toastMsg: '遥控执行成功.',
                toastType: ToastType.Success,
              });
            }else {
              this.$patch({
                toastMsg: '遥控执行失败, 请稍候重试.',
                toastType: ToastType.Failure,
              });
            }
          }),
          catchError(err => {
            this.$patch({
              toastMsg: '遥控执行失败, 请稍候重试.',
              toastType: ToastType.Failure,
            });
            loadingService.hide();
            return of(err);
          }),
          take(1),
          takeUntil(destory$),
        ).subscribe();
      },
      subscribeRecordLoadResult(subscriber: Partial<Record<'next' | 'complete' | 'error', (...args: any[]) => any>>) {
        const ob = new Observable(observer => {
          const subscription = this.$subscribe((mutation, state) => {
            if (mutation.type === MutationType.patchObject) {
              if (DataStatus.Loaded === mutation.payload.meta?.records) {
                observer.next({mutation, state});
                // observer.complete();
              }else if (DataStatus.Error === mutation.payload.meta?.records ) {
                observer.error();
              }
            }
          });
          return () => subscription();
        });
        ob.pipe(
          takeUntil(destory$)
        ).subscribe(subscriber);
      },
      clearRecords() {
        this.$patch({
          records: [],
          meta: {
            records: DataStatus.Unloaded
          },
          isInited: false
        });
      },
      reset() {
        destory$.next(true);
        this.$reset();
      },
      destroy() {
        [...this.checkItemIds].forEach(checkId => {
          checkControlResultService.setNotifyStyle(checkId, OperatorCheckNotifyStyle.Default);
        });
        destory$.next(true);
        destory$.complete();

        // fix: pinia.state will cache state even the store instance was remove by call self dispose;
        // manual call reset make cahce state backto inital status; more detail see the state fn on below;
        // call the dispose first, to remove all subscribe which may invoke by $reset state;
        this.$dispose();
        this.$reset();
      },
    }
  })();
}
