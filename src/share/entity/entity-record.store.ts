import { AxiosRequestConfig } from "axios";
import { defineStore, MutationType } from "pinia";
import { EMPTY, Observable, of, Subject } from "rxjs";
import { catchError, delay, map, repeat, switchMap, takeUntil, takeWhile, tap } from "rxjs/operators";
import { DataStatus } from "../data.meta";
import { httpService, YNAPI_KZCZ } from "../http";
import { loadingService } from "../loading.service";
import { YxOperatorParams, YxOperatorResponse } from "./entity-edit-form.store";
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
}

export function useEntityRecordsStore(entityName: Entities, tabId?: string ) {
  const storeId = getEntityRecordStoreId(entityName, EntityStoreFeature.Record, tabId);
  const destory$ = new Subject<boolean>();
  return defineStore(storeId, {
    state: () => {
      const initialState = {
        entityName: '',
        records: [] as EntityRecord[],
        pagination: {
          current: 1,
          pageSize: 20
        },
        meta: {
          records: DataStatus.Unloaded,
        },
        hasPagination: false,
        toastMsg: '',
        toastType: ToastType.Success,
        startSyncRecrod: false,
        syncFields: [] as string[],
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
      }
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
      getRecords(entityName: Entities, params: { criteria?: Record<string, any>, isInit?: boolean}) {
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
        } else {
          this.$patch({
            meta: {
              records: DataStatus.Loading
            }
          });
        }
        const queryPageIndex = isInit ? 1 : this.pagination.current + 1;
        const postData = this.hasPagination 
          ? { ...criteria, startIndex: (queryPageIndex - 1) * this.pagination.pageSize, endIndex: queryPageIndex * this.pagination.pageSize }
          : { ...criteria };
        getRecords(entityName, postData).pipe(
          takeUntil(destory$)
        ).subscribe(result => {
          // split 
          this.$patch({
            records: [...this.records, ...(result || [])],
            pagination: {
              current: queryPageIndex
            },
            meta: {
              records: DataStatus.Loaded
            }
          });
        });
      },
      startRecordsCheck(params?: Record<string, any>) {
        if (!this.startSyncRecrod && this.syncFields.length > 0) {
          const checkParams = params || {};
          let maxErrorCount = 5;
          const skipMaskConfig: Partial<AxiosRequestConfig> = {headers: {skipMask: true}};
          this.$patch({
            startSyncRecrod: true
          });
          of(0).pipe(
            delay(5000),
            takeWhile(() => this.meta.records === DataStatus.Loaded),
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
              maxErrorCount--;
              console.error(err.message);
              if (!maxErrorCount) { 
                return EMPTY;
              }
              return of({} as Record<string, any>);
            }),
            repeat(),
            takeUntil(destory$),
          ).subscribe({
            next: ({list, isChanged}) => {
              if (isChanged) {
                this.$patch({
                  records: list
                });
              }
            },
            complete: () => {
              this.$patch({
                startSyncRecrod: false
              });
            }
          });
        }
      },
      requestExcute(data: YxOperatorParams) {
        this.$patch({
          toastMsg: '',
          toastType: ToastType.Success,
        });
        const skipMaskConfig: Partial<AxiosRequestConfig> = {headers: {skipMask: true}};
        loadingService.show({
          message: '发送遥控执行，请等候...'
        });
        of(0).pipe(
          map(() => {
            return true;
          }),
          delay(500),
          tap(() => {
            loadingService.hide();
          }),
          catchError(err => {
            loadingService.hide();
            return of(err);
          }),
          takeUntil(destory$),
        ).subscribe(success => {
          const msg = success ? '发送遥控执行成功。' : '发送遥控执行失败！';
          const type = success ? ToastType.Success : ToastType.Failure;
          this.$patch({
            toastMsg: msg,
            toastType: type,
          });
        });
      },
      subscribeRecordLoadResult(callback: (...args: any[]) => any) {
        const ob = new Observable(subscriber => {
          const subscription = this.$subscribe((mutation, state) => {
            if (mutation.type === MutationType.patchObject && mutation.payload.records?.length) {
              if (DataStatus.Loaded === mutation.payload.meta?.records) {
                subscriber.next({mutation, state});
                subscriber.complete();
              }else if (DataStatus.Error === mutation.payload.meta?.records ) {
                subscriber.error();
              }
            }
          });
          return () => subscription();
        });
        ob.pipe(
          takeUntil(destory$)
        ).subscribe({next: callback, error: callback});
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
