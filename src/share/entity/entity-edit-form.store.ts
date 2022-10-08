import { AxiosRequestConfig } from "axios";
import { defineStore } from "pinia";
import { EMPTY, of, Subject } from 'rxjs';
import { catchError, delay, filter, finalize, map, repeat, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { DataStatus } from "../data.meta";
import { checkControlResultService, getCheckItemId, OperatorCheckNotifyStyle } from "../hooks/use-check-operator";
import { httpService, YNAPI_KZCZ } from "../http";
import { loadingService } from "../loading.service";
import { ControlStatusCode, ControlStatusTextMap } from "./data/operations";
import { EntityStoreFeature, getEntityRecordStoreId } from "./entity-store-id";
import { getEditForm$ } from './entity.service';
import { Entities, FormField } from "./entity.types";

export enum OperatorType {
  RemoteSelect = 'remoteSelect',
  RemoteExcute = 'remoteExcute',
}
export interface SwitchItemStateInfo {
  kfId: string;
  khId: string;
}
export type YxOperatorParams = Record<'yxIds' | 'khId' | 'kfId' | 'action', string>;

export interface YxOperatorResponse {
  isYxEffect: boolean;
  sendActionSuccess: boolean;
  validateDate: string;
}

export type YxCheckResponse =  Record<'hasNewControlResult' | 'result', 0 | 1>;

const skipMaskConfig: Partial<AxiosRequestConfig> = {headers: {skipMask: true}};

export function useEntityEditFormStore(entityName: Entities, recordId: string) {
  const storeId = getEntityRecordStoreId(entityName, EntityStoreFeature.EditForm, recordId);
  const destory$ = new Subject<boolean>();

  return defineStore(storeId, {
    state: () => {
      const initialState = { 
        entityName: entityName, 
        recordId: recordId,
        currRecordInfo: {} as SwitchItemStateInfo, //#WIP, special for pcb entry operator control, change api to remove this state; 
        editForm: [] as FormField[],
        meta: {
          editForm: DataStatus.Unloaded,
        },
        operatorId: OperatorType.RemoteSelect,
        operatorMsg: '',
        checkItemIds: new Set<string>(),
      };
      // subscribe check service result if it met the current store check
      return {...initialState, entityName};
    },
    actions: {
      getEditForm() {
        if (![DataStatus.Loaded, DataStatus.Loading].includes(this.$state.meta.editForm)){
          getEditForm$(entityName || this.$state.entityName).pipe(
            switchMap(form => {
              if (Object.keys(this.currRecordInfo).length) {
                const postData = {
                  yxIds: this.recordId,
                  khId: this.currRecordInfo.khId,
                  kfId: this.currRecordInfo.kfId,
                  jxtId: '',
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

        loadingService.show({
          message: '申请遥控选择中，请等候...'
        });
        this.$patch({
          operatorMsg: ''
        });
        httpService.post<YxOperatorResponse>(YNAPI_KZCZ.RemoteSelect, data, skipMaskConfig).pipe(
          tap(() =>  loadingService.hide()),
          switchMap(response => {
            const result = response.data || {};
            const checkId = getCheckItemId(entityName, recordId, OperatorType.RemoteSelect);
            if (result.isYxEffect && result.sendActionSuccess) {
              this.checkItemIds.add(checkId);
              checkControlResultService.addCheckItem({
                id: checkId,
                url: YNAPI_KZCZ.CheckControlResult,
                payload: {
                  controlType: OperatorType.RemoteSelect,
                  yxIds: data.yxIds,
                  action: data.action,
                  validateDate: result.validateDate,
                },
                retryCount: 4,
                intervalTime: 10 * 1000,
                incrementIntervalTime: 0,
                notifyInfo: {
                  success: {
                    title: '申请遥控选择成功',
                    message: `控制类型：遥控选择; 遥信ID: ${data.yxIds}; 操作： ${ControlStatusTextMap[data.action as ControlStatusCode]};.`,
                  },
                  failure: {
                    title: '申请遥控选择失败',
                    message: `控制类型：遥控选择; 遥信ID: ${data.yxIds}; 操作： ${ControlStatusTextMap[data.action as ControlStatusCode]};.`,
                  }
                },
                style: OperatorCheckNotifyStyle.Custom 
              }, (checkResult) => {
                return !checkResult.hasNewControlResult && checkResult.result === 1;
              });
              return checkControlResultService.getCheckResult$(checkId).pipe(
                finalize(() => {
                  this.checkItemIds.delete(checkId);
                })
              );  
            }

            this.$patch({
              operatorMsg: '申请遥控选择失败, 请稍候重试.'
            });
            return EMPTY;
          }),
          tap(checkResult => {
            if (checkResult) {
              this.$patch({
                operatorId: OperatorType.RemoteExcute,
                operatorMsg: '申请遥控选择成功.'
              });
            }else {
              this.$patch({
                operatorMsg: '申请遥控选择失败, 请稍候重试.'
              });
            }
          }),
          catchError(err => {
            this.$patch({
              operatorMsg: '申请遥控选择失败, 请稍候重试.'
            });
            return of(err);
          }),
          take(1),
          takeUntil(destory$),
        ).subscribe();
      },
      requestExcute(data: YxOperatorParams) {
        loadingService.show({
          message: '遥控执行中，请等候...'
        });
        httpService.post<YxOperatorResponse>(YNAPI_KZCZ.RemoteExcute, data, skipMaskConfig).pipe(
          switchMap(response => {
            const action = response.data || {};
            let retryCount = 3;
            // eslint-disable-next-line no-constant-condition
            if (action.isYxEffect && action.sendActionSuccess) {
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
              operatorMsg: '遥控执行失败, 请稍候重试.'
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
                operatorMsg: '遥控执行失败, 请稍候重试.'
              });
            }
          }),
          catchError(err => {
            this.$patch({
              operatorMsg: '遥控执行失败, 请稍候重试.'
            });
            return of(err);
          }),
          take(1),
          takeUntil(destory$),
        ).subscribe({
          next: () => () => {loadingService.hide();},
          complete: () => {loadingService.hide();},
          error: () => {loadingService.hide();}
        });
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
      }
    }
  })();
}
