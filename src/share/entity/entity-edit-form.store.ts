import { AxiosRequestConfig } from "axios";
import { defineStore } from "pinia";
import { asyncScheduler, EMPTY, of, Subject, throwError } from 'rxjs';
import { catchError, delay, dematerialize, filter, finalize, map, materialize, repeat, switchMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { DataStatus } from "../data.meta";
import { appState$ } from "../hooks/use-app.store";
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
  startIndex: number;
}

export enum OperatorStatus {
  Empty = 'empty',
  RemoteSelect =  'remoteSelect',
  RemoteExcute = 'remoteExcute',
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
        operatorStatus: OperatorStatus.Empty,
        operatorId: OperatorType.RemoteSelect,
        operatorMsg: '',
        checkItemIds: new Set<string>(),
        startSyncForm: false,
        syncFields: [] as string[],
        isInited: false,
        formSchema: [] as FormField[],
      };
      // subscribe check service result if it met the current store check
      return {...initialState, entityName};
    },
    actions: {
      getEditForm() {
        if (![DataStatus.Loaded, DataStatus.Loading].includes(this.$state.meta.editForm)){
          getEditForm$(entityName || this.$state.entityName).pipe(
            switchMap(form => {
              this.formSchema = form;
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
                          resultValue = ControlStatusCodeTexts[value as ControlStatusCode] || '';
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
                    return fields.filter(x => !!x) as FormField[];
                  })
                );
              } 
              return EMPTY;
            }),
            catchError(() => {
              this.$patch({
                meta: {
                  editForm: DataStatus.Error
                }
              });
              return of([] as FormField[]);
            }),
            take(1),
            takeUntil(destory$),
          ).subscribe(forms => {
            this.$patch({
              editForm: forms,
              meta: {
                editForm: DataStatus.Loaded
              },
              isInited: true
            });
          });
        }
      },
      startCheckForm() {
        if (Object.keys(this.currRecordInfo).length && !this.startSyncForm && this.syncFields.length > 0) {
          const checkParams = {
            yxIds: this.recordId,
            khId: this.currRecordInfo.khId,
            kfId: this.currRecordInfo.kfId,
            jxtId: '',
          };
          const skipMaskConfig: Partial<AxiosRequestConfig> = {headers: {skipMask: true}};
          // let maxErrorCount = 5;
          this.$patch({
            startSyncForm: true
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
              return httpService.post(YNAPI_KZCZ.GetDetail, checkParams, skipMaskConfig).pipe(
                map((response: any) => {
                  const fields = Object.entries((response?.data || {}) as Record<string, string | number>).map(([id, value]) => {
                    const metaInfo = this.formSchema.find(item => item.id === id) as FormField;
                    if (metaInfo) {
                      let resultValue = value;
                      let readonly = false;
                      if (id === 'status') {
                        resultValue = ControlStatusCodeTexts[value as ControlStatusCode] || '';
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
                  return fields.filter(x => !!x) as FormField[];
                }),
                map(newResult => {
                  const isChanged = this.syncFields.some(fieldId => {
                    const currFieldValue = this.editForm.find(x => x.id === fieldId)?.value;
                    const nextFieldValue = newResult.find(x => x.id === fieldId)?.value;
                    return currFieldValue !== nextFieldValue;
                  });
                  return { list: newResult, isChanged };
                }),
              );
            }),
            catchError(err => {
              // maxErrorCount--;
              // console.error(err.message);
              // if (!maxErrorCount) { 
              //   // return throwError(() => err);  
              //   return of({} as Record<string, any>);
              // }
              //not stop the check, may network offline
              return of({} as Record<string, any>);
            }),
            repeat({
              delay: () => {
                return of(0).pipe(delay(1 * 1000, asyncScheduler));
              }
            }),
            takeUntil(destory$),
          ).subscribe({
            next: (result) => {
              const {list, isChanged} = result as any;
              if (isChanged) {
                this.$patch({
                  editForm: list
                });
              }
            },
            complete: () => {
              this.$patch({
                startSyncForm: false
              });
            },
            error: () => {
              this.$patch({
                startSyncForm: false
              });
            },
          });
        }
      },
      requestSelect(data: YxOperatorParams) {

        loadingService.show({
          message: '申请遥控选择中，请等候...'
        });
        this.$patch({
          operatorMsg: '',
          operatorStatus: OperatorStatus.RemoteSelect,
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
                  startIndex: result.startIndex
                },
                retryCount: 6,
                intervalTime: 2 * 1000,
                incrementIntervalTime: 3 * 1000,
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
              operatorMsg: '申请遥控选择失败, 请稍候重试.',
              operatorStatus: OperatorStatus.Empty,
            });
            return EMPTY;
          }),
          tap(checkResult => {
            if (checkResult) {
              this.$patch({
                operatorId: OperatorType.RemoteExcute,
                operatorMsg: '申请遥控选择成功.',
                operatorStatus: OperatorStatus.Empty,
              });
            }else {
              this.$patch({
                operatorMsg: '申请遥控选择失败, 请稍候重试.',
                operatorStatus: OperatorStatus.Empty,
              });
            }
          }),
          catchError(err => {
            this.$patch({
              operatorMsg: '申请遥控选择失败, 请稍候重试.',
              operatorStatus: OperatorStatus.Empty,
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
          operatorMsg: '',
          operatorStatus: OperatorStatus.RemoteExcute,
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
                  startIndex: result.startIndex,
                },
                retryCount: 6,
                intervalTime: 2 * 1000,
                incrementIntervalTime: 3 * 1000,
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
              operatorMsg: '遥控执行失败, 请稍候重试.',
              operatorStatus: OperatorStatus.Empty,
            });
            return EMPTY;
          }),
          tap(checkResult => {
            if (checkResult) {
              this.$patch({
                operatorId: OperatorType.RemoteSelect,
                operatorMsg: '遥控执行成功.',
                operatorStatus: OperatorStatus.Empty,
              });
            }else {
              this.$patch({
                operatorId: OperatorType.RemoteSelect,
                operatorMsg: '遥控执行失败, 请稍候重试.',
                operatorStatus: OperatorStatus.Empty,
              });
            }
          }),
          catchError(err => {
            this.$patch({
              operatorId: OperatorType.RemoteSelect,
              operatorMsg: '遥控执行失败, 请稍候重试.',
              operatorStatus: OperatorStatus.Empty,
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
