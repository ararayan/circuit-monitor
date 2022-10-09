import { AxiosRequestConfig } from "axios";
import { defineStore } from "pinia";
import { EMPTY, of, Subject } from 'rxjs';
import { catchError, delay, filter, finalize, map, repeat, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { DataStatus } from "../data.meta";
import { checkControlResultService, getCheckItemId, OperatorCheckNotifyStyle } from "../hooks/use-check-operator";
import { httpService, YNAPI_KZCZ } from "../http";
import { loadingService } from "../loading.service";
import { ControlStatusCode, ControlStatusCodeIds, ControlStatusCodeTexts } from "./data/operations";
import { EntityStoreFeature, getEntityRecordStoreId } from "./entity-store-id";
import { getEditForm$ } from './entity.service';
import { Entities, FormField } from "./entity.types";

export enum OperatorType {
  RemoteSelect = 'remoteSelect',
  RemoteExcute = 'remoteExcute',
}
export interface ControlStatusIds {
  kfId: string;
  khId: string;
}
export interface YxOperatorParams {
  yxIds: string;
  khId: string;
  kfId: string;
  action: ControlStatusCode;
}

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
        currRecordInfo: {} as ControlStatusIds, //#WIP, special for pcb entry operator control, change api to remove this state; 
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
                          resultValue = ControlStatusCodeTexts[value as 'wx' | 'fen' | 'he'] || '';
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
                  kfkhID: data[ControlStatusCodeIds[data.action as ControlStatusCode.Fen | ControlStatusCode.He]],
                  action: data.action,
                  validateDate: result.validateDate,
                },
                retryCount: 5,
                intervalTime: 10 * 1000,
                incrementIntervalTime: 0,
                notifyInfo: {
                  success: {
                    title: '申请遥控选择成功',
                    message: `遥信ID: ${data.yxIds}; 操作：${ControlStatusCodeTexts[data.action as ControlStatusCode]};`,
                  },
                  failure: {
                    title: '申请遥控选择失败',
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
        this.$patch({
          operatorMsg: ''
        });
        httpService.post<YxOperatorResponse>(YNAPI_KZCZ.RemoteExcute, data, skipMaskConfig).pipe(
          tap(() =>  loadingService.hide()),
          switchMap(response => {
            const result = response.data || {};
            const checkId = getCheckItemId(entityName, recordId, OperatorType.RemoteExcute);
            if (result.isYxEffect && result.sendActionSuccess) {
              this.checkItemIds.add(checkId);
              checkControlResultService.addCheckItem({
                id: checkId,
                url: YNAPI_KZCZ.CheckControlResult,
                payload: {
                  controlType: OperatorType.RemoteExcute,
                  kfkhID: data[ControlStatusCodeIds[data.action as ControlStatusCode.Fen | ControlStatusCode.He]],
                  action: data.action,
                  validateDate: result.validateDate,
                },
                retryCount: 5,
                intervalTime: 10 * 1000,
                incrementIntervalTime: 0,
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
              operatorMsg: '遥控执行失败, 请稍候重试.'
            });
            return EMPTY;
          }),
          tap(checkResult => {
            if (checkResult) {
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
        ).subscribe();
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
