import { AxiosRequestConfig } from "axios";
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
export interface SwitchItemStateInfo {
  kfId: string;
  khId: string;
}
export type YxOperatorParams = Record<'yxIds' | 'khId' | 'kfId' | 'action', string>;

export type YxOperatorResponse =  Record<'isYxEffect' | 'sendActionSuccess', boolean>;
export type YxCheckResponse =  Record<'hasNewControlResult' | 'result', 0 | 1>;

export function useEntityEditFormStore(entityName: Entities, recordId: string) {
  const storeId = getEntityRecordStoreId(entityName, EntityStoreFeature.EditForm, recordId);
  const destory$ = new Subject<boolean>();

  return defineStore(storeId, {
    state: () => {
      const initialState = { 
        entityName: entityName, 
        recordId: recordId,
        currRecordInfo: {} as SwitchItemStateInfo, //#WIP, special for pcb entry operator control, change api to remove this state; 
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
            map(form => {
              form.forEach(item => {
                if(item.id === 'changzhan') {
                  item.value = '衍能一厂';
                }else if (item.id === 'dianming') {
                  item.value = '4号站点125kv';
                }else if (item.id === 'status') {
                  item.value = '受控中';
                }else if (item.id === 'controlType') {
                  item.value = 'control1';
                }else if (item.id === 'zhaStatus') {
                  item.value = 'he';
                }
              });
              return form;
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
        of(0).pipe(
          map(() => {
            return {
              data: {
                hasNewControlResult: false,
                result: 1
              }
            };
          }),
          delay(1000),
          tap(response => {
            const checkResult = response.data;
            // eslint-disable-next-line no-constant-condition
            if ((!checkResult.hasNewControlResult && checkResult.result === 1)) {
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
        loadingService.show({
          message: '遥控执行中，请等候...'
        });
        of(0).pipe(
          map(() => {
            return {
              data: {
                hasNewControlResult: false,
                result: 1
              }
            };
          }),
          delay(1500),
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
