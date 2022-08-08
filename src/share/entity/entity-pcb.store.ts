import { defineStore } from "pinia";
import { ActionStatus, DataStatus } from "../data.meta";
import { httpService, YNAPI_JXT } from "../http";
import { EntityStoreFeature, getEntityRecordStoreId } from "./entity-store-id";
import { Entities, EntityRecord } from "./entity.types";
import { map, switchMap, take, takeUntil, repeat, delay, catchError, filter } from 'rxjs/operators';
import { EMPTY, of, Subject } from "rxjs";



export enum PCBItemType {
  Base = 'base',
  Switch = 'switch',
  Font = 'font',
  Unknown = 'unknown',
}

export function getPcbItemType(data: { zlt?: string, fen_he_other?: string, fontGB2312?: string }) {
  const type = data?.zlt
    ? PCBItemType.Base
    : data?.fen_he_other
      ? PCBItemType.Switch
      : data?.fontGB2312
        ? PCBItemType.Font
        : PCBItemType.Unknown;
  return type;
}

type PatchSwitchInfo = Record<string, {value: string}>;

export interface PCBRect {
  left: number,
  top: number,
  right: number,
  bottom: number;
}
export interface PCBBaseMapItem extends PCBRect{
  ['left|top|right|bottom']: string;
  id: string;
  zlt: string;
  width: number;
  height: number;
  value: string;
}


export const SwitchItemStatusImageKeyMap: Record<string, 'openImage' |'closeImage' | 'otherImage'> = {
  fen: 'openImage',
  he: 'closeImage',
  wx: 'otherImage',
};
export interface PCBSwitchItem extends PCBRect {
  id: string;
  ['left|top|right|bottom']: string;
  ['fen_he_other']: string;
  kf: string;
  kh: string;
  yx: string;
  openImage: string;
  closeImage: string;
  otherImage: string;
  value: string;
}

export interface PCBFontItem {
  id: string;
  ['left|top']: string;
  ['fen_he_other']: string;
  Ia: string;
  colorRGB:string;
  fontGB2312: string;
  yc: string;
  left: number,
  top: number,
  value: string;
}





export function useEntityPCBStore(entityName: Entities, recordId: string) {
  const destory$ = new Subject<boolean>();
  const storeId = getEntityRecordStoreId(entityName, EntityStoreFeature.PCB, recordId);

  const store = defineStore(storeId, {
    state: () => {
      // move all the state deps variable in state create fn, make sure initalState clear after every time $reset call!
      const initialState = {
        entityName: entityName,
        recordId: recordId,
        baseMapItem: {
          id: '',
          zlt: '',
          width: 0,
          height: 0,
          value: '',
        }  as PCBBaseMapItem,
        switchItems: {} as Record<string, PCBSwitchItem>,
        fontItems: [] as PCBFontItem[],
        meta: {
          pcbInfo: DataStatus.Unloaded,
          switchItemUpdate: ActionStatus.Inactive
        },
      };
      return { ...initialState, entityName };
    },
    getters: {
      getSwitchItem: (state) => (id: string) => state.switchItems[id] || {} as PCBSwitchItem,
      getSwitchImage: (state) => {
        return (id: string) => {
          const item = state.switchItems[id];
          if (item) {
            const imageBase64String = item[SwitchItemStatusImageKeyMap[item.value]];
            return imageBase64String;
          }
          return ''; 
        };
      },
      getFontvalue: (state) => (id: string) => state.fontItems.find(item => item.id === id)?.value || '',
    },
    actions: {
      getPCBInfos(openRecordId: string) {
        if (openRecordId === '') {
          return ;
        }
        if (![DataStatus.Loaded, DataStatus.Loading].includes(this.$state.meta.pcbInfo)) {
          httpService.post(YNAPI_JXT.GetPicture, {id: openRecordId}).pipe(
            map(response => {
              const imageInfos = response.data?.image || {};
              let baseMapItem = {} as PCBBaseMapItem;
              const switchItems = {} as Record<string, PCBSwitchItem>;
              const fontItems: PCBFontItem[] = [];
              response?.data?.map?.forEach((item: any) => {
                const type = getPcbItemType(item);
                if (type !== PCBItemType.Font) {
                  const [left, top, right, bottom] = item['left|top|right|bottom'].split('|').map((x: string) => {
                    const numb = parseFloat(x);
                    if (isNaN(numb)) {
                      console.error('api return data error, expect item left|top|right|bottom value can note been numberic!' + item);
                    }
                    return isNaN(numb) ? 0 : numb;
                  }) as number[];
                  if (type === PCBItemType.Base) {
                    const width = Math.abs(left - right);
                    const height = Math.abs(top - bottom);
                    const zltImageName = item.zlt.split('.')[0];
                    const baseImage = imageInfos[zltImageName];
                    baseMapItem = { ...item, left, top, right, bottom, width, height, value: baseImage, id: zltImageName };
                  } else if (type === PCBItemType.Switch) {
                    const [open, close, other] = (item['fen_he_other'] as string).split('|').map(x => {
                      const key = x.split('.')[0];
                      if (!key) {
                        console.error('api return data error, expect item fen_he_other value can not extract image key!' + x);
                      }
                      return key;
                    });
                    const switchItem = { 
                      ...item, left, top, right, bottom, 
                      openImage: imageInfos[open], closeImage: imageInfos[close], otherImage: imageInfos[other],
                      value: '', id: item.yx };
                    switchItems[item.yx] = switchItem;
                  }
                } else {
                  const [left, top] = item['left|top'].split('|').map((x: string) => {
                    const numb = parseFloat(x);
                    if (isNaN(numb)) {
                      console.error('api return data error, expect item left|top value can note been numberic!' + item);
                    }
                    return isNaN(numb) ? 0 : numb;
                  }) as number[];
                  const fontItem = { ...item, left, top, value: '', id: item.yc };
                  fontItems.push(fontItem);
                }
  
              });
              return {
                baseMapItem,
                switchItems,
                fontItems,
              };
            }),
            switchMap(({baseMapItem, switchItems, fontItems}) => {
              //#region: API
              const ycIds = fontItems.map(x => x.yc) as string[];
              const yxIds = Object.keys(switchItems);
              //#endregion: API
              return httpService.post(YNAPI_JXT.GetPCBStatus, {ycIds, yxIds}).pipe(
                map(valueInfosResult => {
                  const valueInfos = valueInfosResult?.data || {};
                  const ycInfos = (valueInfos?.yc || []).reduce((acc: any, valueInfo: any) => {
                    acc = {...acc, ...valueInfo};
                    return acc;
                  }, {});
                  // const yxInfos = (valueInfos?.yx || []).reduce((acc: any, valueInfo: any) => {
                  //   acc = {...acc, ...valueInfo};
                  //   return acc;
                  // }, {});
                  ((valueInfos?.yx || []) as Record<string, string>[]).forEach(valueInfo => {
                    const [[id, value]] = Object.entries(valueInfo);
                    switchItems[id].value = value || '';
                  });
                  fontItems.forEach(fontItem => {
                    fontItem.value = ycInfos[fontItem.yc] || '';
                  });
                  return {baseMapItem, switchItems, fontItems};
                })
              );
            }),
            take(1),
            takeUntil(destory$),
          ).subscribe(response => {
            this.$patch({
              ...response,
              meta: {
                pcbInfo: DataStatus.Loaded,
              }
            });
          });
        }
      },
      startSwitchItemsCheck() {
        if (![ActionStatus.InProgress].includes(this.$state.meta.switchItemUpdate)) {
          const yxIds = Object.keys(this.switchItems);
          let maxErrorCount = 5;
          const skipMaskConfig = {params: {skipMask: true}};
          this.$patch({
            meta: {
              switchItemUpdate: ActionStatus.InProgress
            }
          });
          of(0).pipe(
            switchMap(() => {
              return httpService.post(YNAPI_JXT.GetPCBStatus, {yxIds}, skipMaskConfig).pipe(
                map(response => {
                  const yxInfos = (response.data?.yx || []) as Record<string, string>[];
                  const patchChangedInfos = yxInfos.reduce((acc, valueInfo) => {
                    const [[id, value]] = Object.entries(valueInfo);
                    if (this.switchItems[id].value !== value) {
                      acc[id] = {value};
                    }
                    return acc;
                  }, {} as PatchSwitchInfo);
                  return patchChangedInfos;
                })
              );
            }),
            catchError(err => {
              maxErrorCount--;
              console.error(err.message);
              if (!maxErrorCount) { 
                return EMPTY;
              }
              return of({} as PatchSwitchInfo);
            }),
            repeat({
              delay: () => {
                return of(0).pipe(delay(2000));
              }
            }),
            filter(patchChangedInfos => {
              const needPatch = !!Object.keys(patchChangedInfos).length;
              if (needPatch) {
                return true;
              } 
              return false;
            }),
            takeUntil(destory$),
          ).subscribe({
            next: (patchChangedInfos) => {
              this.$patch({
                switchItems: {
                  ...patchChangedInfos
                },
                meta: {
                  switchItemUpdate: ActionStatus.End
                }
              });
            },
            complete: () => {
              if (this.meta.switchItemUpdate !== ActionStatus.End) {
                this.$patch({
                  meta: {
                    switchItemUpdate: ActionStatus.End
                  }
                });
              }
            }
          });
        }
      },
      destroy() {
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

  return store;
}