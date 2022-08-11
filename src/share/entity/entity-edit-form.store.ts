import { Axios, AxiosResponse } from "axios";
import { defineStore } from "pinia";
import { EMPTY, of, Subject } from 'rxjs';
import { catchError, delay, filter, map, repeat, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { DataStatus } from "../data.meta";
import { httpService, YNAPI_KZCZ } from "../http";
import { loadingService } from "../loading.service";
import { ControlStatusTextMap } from "./data/operations";
import { EntityStoreFeature, getEntityRecordStoreId } from "./entity-store-id";
import { getEditForm$ } from './entity.service';
import { Entities, FormField } from "./entity.types";

export enum OperatorType {
  RemoteSelect = 'remoteSelect',
  RemoteExcute = 'remoteExcute',
}
export interface QueryEditFormParams {
  parentRecordId: string;
  recordId: string;
  kfId: string;
  khId: string;
}
type YxOperatorParams = Record<'yxIds' | 'khId' | 'kfId' | 'action', string>;

type YxOperatorResponse =  Record<'isYxEffect' | 'sendActionSuccess', boolean>;
type YxCheckResponse =  Record<'hasNewControlResult' | 'result', 0 | 1>;

export function useEntityEditFormStore(entityName: Entities, recordId: string) {
  const storeId = getEntityRecordStoreId(entityName, EntityStoreFeature.EditForm, recordId);
  const destory$ = new Subject<boolean>();

  return defineStore(storeId, {
    state: () => {
      const initialState = { 
        entityName: entityName, 
        recordId: recordId,
        queryFormParams: {} as QueryEditFormParams,
        editForm: [] as  FormField[],
        meta: {
          editForm: DataStatus.Unloaded,
        },
        operatorId: OperatorType.RemoteSelect,
        operatorMsg: '',
      };
      return {...initialState, entityName};
    },
    actions: {
      getEditForm() {
        if (![DataStatus.Loaded, DataStatus.Loading].includes(this.$state.meta.editForm)){
          getEditForm$(entityName || this.$state.entityName).pipe(
            switchMap(form => {
              if (Object.keys(this.$state.queryFormParams).length) {
                const postData = {
                  yxIds: this.$state.queryFormParams.recordId,
                  khId: this.$state.queryFormParams.khId,
                  kfId: this.$state.queryFormParams.kfId,
                  jxtId: this.$state.queryFormParams.parentRecordId,
                };
                return httpService.post(YNAPI_KZCZ.GetDetail, postData).pipe(
                  map((response: any) => {
                    const fields = Object.entries((response?.data || {}) as Record<string, string | number>).map(([id, value]) => {
                      const metaInfo = form.find(item => item.id === id) as FormField;
                      if (metaInfo) {
                        let resultValue = value;
                        let readonly = false;
                        if (id === 'status') {
                          resultValue = ControlStatusTextMap[value as 'wx' | 'fen' | 'he'] || '';
                          readonly = true;
                        }
                        const item: FormField = {
                          ...metaInfo,
                          value: resultValue,
                          disabled: false,
                          readonly,
                        };
                        
                        return item;
                      }
                      return null;
                    });
                    return fields.filter(x => !!x);
                  })
                );
              } 
              return EMPTY;
            }),
            catchError(err => {
              this.$patch({
                meta: {
                  editForm: DataStatus.Error
                }
              });
              return of(err);
            }),
            take(1),
            takeUntil(destory$),
          ).subscribe(forms => {
            this.$patch({
              editForm: forms,
              meta: {
                editForm: DataStatus.Loaded
              }
            });
          });
        }
      },
      requestSelect(data: YxOperatorParams) {
        const skipMaskConfig = {params: {skipMask: true}};
        loadingService.show({
          message: '申请遥控选择中，请等候...'
        });
        httpService.post<YxOperatorResponse>(YNAPI_KZCZ.RemoteSelect, data, skipMaskConfig).pipe(
          switchMap(response => {
            const action = response.data || {};
            let retryCount = 3;
            // eslint-disable-next-line no-constant-condition
            if (action.isYxEffect && action.sendActionSuccess || true) {
              return of(0).pipe(
                switchMap(() => {
                  return httpService.post<YxCheckResponse>(YNAPI_KZCZ.CheckControlResult, {
                    controlType: OperatorType.RemoteSelect,
                    yxIds: data.yxIds,
                    action: data.action,
                  }, skipMaskConfig);
                }),
                repeat({
                  count: retryCount + 1,
                  delay: () => {
                    retryCount--;
                    return of(0).pipe(delay(500));
                  }
                }),
                catchError(err => {
                  console.error(err.message);
                  return of({data: {hasNewControlResult: 0, result: 0}});
                }),
                filter(x => {
                  const checkResult = x.data;
                  if ((!checkResult.hasNewControlResult && checkResult.result === 1) || !retryCount) {
                    return true;
                  } 
                  return false;
                }),
                take(1),
              );        
            }
            this.$patch({
              operatorMsg: '申请遥控选择失败.'
            });
            return EMPTY;
          }),
          tap(response => {
            const checkResult = response.data;
            // eslint-disable-next-line no-constant-condition
            if ((!checkResult.hasNewControlResult && checkResult.result === 1) || true) {
              this.$patch({
                operatorId: OperatorType.RemoteExcute,
                operatorMsg: '申请遥控选择成功.'
              });
            }else {
              this.$patch({
                operatorMsg: '申请遥控选择失败.'
              });
            }
          }),
          catchError(err => {
            this.$patch({
              operatorMsg: '申请遥控选择失败.'
            });
            return of(err);
          }),
          take(1),
          takeUntil(destory$),
        ).subscribe({
          complete: () => {loadingService.hide();},
          error: () => {loadingService.hide();}
        });
      },
      requestExcute(data: YxOperatorParams) {
        const skipMaskConfig = {params: {skipMask: true}};
        loadingService.show({
          message: '遥控执行中，请等候...'
        });
        httpService.post<YxOperatorResponse>(YNAPI_KZCZ.RemoteExcute, data, skipMaskConfig).pipe(
          switchMap(response => {
            const action = response.data || {};
            let retryCount = 3;
            // eslint-disable-next-line no-constant-condition
            if (action.isYxEffect && action.sendActionSuccess || true) {
              return of(0).pipe(
                switchMap(() => {
                  return httpService.post<YxCheckResponse>(YNAPI_KZCZ.CheckControlResult, {
                    controlType: OperatorType.RemoteExcute,
                    yxIds: data.yxIds,
                    action: data.action,
                  },skipMaskConfig);
                }),
                repeat({
                  count: retryCount + 1,
                  delay: () => {
                    retryCount--;
                    return of(0).pipe(delay(500));
                  }
                }),
                catchError(err => {
                  console.error(err.message);
                  return of({data: {hasNewControlResult: 0, result: 0}});
                }),
                filter(x => {
                  const checkResult = x.data;
                  if ((!checkResult.hasNewControlResult && checkResult.result === 1) || !retryCount) {
                    return true;
                  } 
                  return false;
                }),
                take(1),
              ); 
            }
            this.$patch({
              operatorMsg: '遥控执行失败.'
            });
            return EMPTY;
          }),
          tap(response => {
            if (!response.data?.hasNewControlResult && response.data?.result === 1) {
              this.$patch({
                operatorId: OperatorType.RemoteSelect,
                operatorMsg: '遥控执行成功.'
              });
            }else {
              this.$patch({
                operatorMsg: '遥控执行失败.'
              });
            }
          }),
          catchError(err => {
            this.$patch({
              operatorMsg: '遥控执行失败.'
            });
            return of(err);
          }),
          take(1),
          takeUntil(destory$),
        ).subscribe({
          complete: () => {loadingService.hide();},
          error: () => {loadingService.hide();}
        });
      },
      destroy() {
        destory$.next(true);
        destory$.complete();

        // fix: pinia.state will cache state even the store instance was remove by call self dispose;
        // manual call reset make cahce state backto inital status; more detail see the state fn on below;
        this.$reset();
        this.$dispose();
      }
    }
  })();
}
