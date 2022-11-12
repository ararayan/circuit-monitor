/* eslint-disable no-else-return */
import { AxiosRequestConfig } from 'axios';
import { delay, map, Observable, of, take, tap } from 'rxjs';
import { cacheService, StorageType, YNCacheKey } from '../cache.service';
import { httpService, YNAPI_JGSJ, YNAPI_JXT, YNAPI_KZCZ, YNAPI_SJCX, YNAPI_ZMGL } from '../http';
import { events, operations } from "./data";
import { ControlStatusCode } from './data/operations';
import { MixedModuleType } from './entity-tab.store';
import { Entities, EntityRecord, EntityRecordAlias, FormField } from "./entity.types";


export const entityMappingTitle: Record<Entities, string> = {
  [Entities.Wirings]: '接线图',
  [Entities.Segments]: '间隔数据',
  [Entities.Realtime]: '实时数据',
  [Entities.Operations]:  '控制操作', 
  [Entities.LightingControl]: '照明管理', 
  [Entities.Events]: '事件查询',
  [Entities.SegmentsChild]: 'NUll',
  [Entities.Empty]: 'NUll',

};

export function getSearchForm$(entityName: Entities) {
  let result: FormField[] = [];
  switch(entityName) {
  case Entities.Events:
    result = events.getSearchForm();
    break;
  default:
    break;
  }
  return of(result);
}
export function getEditForm$(entityName: Entities) {
  let result: FormField[] = [];
  switch(entityName) {
  case Entities.Operations:
    result = JSON.parse(JSON.stringify(operations.editForm));
    break;
  default:
    break;
  }
  return of(result);
}

export interface FixedModuleRecord {
  index: number;
  name: string;
  status: ControlStatusCode;
  value: string;
}

export interface OperationListItem {
  index:number;
  kfId:number;
  khId:number;
  name: string;
  yxId:number;
}
export interface LightingControlRecord {
  id: number;
  index: number;
  kfId: number;
  khId: number;
  name: string; //"装置1信号复归"
  yxId: number;
}

export interface EventRecord {
  // id: number;
  id: number;
  pos: string;
  state: ControlStatusCode;
  msg: string;
  date: string;
}



export function getRecords(entityName: Entities, params?: any, config?: AxiosRequestConfig): Observable<EntityRecord[]> {
  if ([Entities.SegmentsChild, Entities.Realtime].includes(entityName)) {
    return httpService.post<EntityRecordAlias<FixedModuleRecord>[]>(YNAPI_JGSJ.GetData, params || {}, config).pipe(
      map(response => {
        //WIP: API
        return response?.data.map(item => {
          let desc;
          if (params.type === MixedModuleType.Yx) {
            // desc = ControlStatusCodeTexts[item.status];
            if (item.status === ControlStatusCode.FenWx) {
              desc = '0(无效)';
            } else if (item.status === ControlStatusCode.HeWx) {
              desc = '1(无效)';
            } else if (item.status === ControlStatusCode.He) {
              desc = '1';
            } else {
              desc = '0';
            }
          }else {
            desc = item.value.replace('wx', '无效');
          }
          return {...item, id: item.index, desc,  };
        }).filter(x => !!x.name) || [];
      })
    );
  }
  if (entityName === Entities.Wirings) {
    return httpService.post<EntityRecord[]>(YNAPI_JXT.GetList, params || {}, config).pipe(
      map(response => {
        return response?.data || [];
      }),
      tap(list => {
        // cache??? has issue between get list and get image duration the image file refresh in server;
        const cache = cacheService.get(YNCacheKey.JXT);
        const enrichList = list.map(item => {
          return {
            ...item,
            hasNewImage: item.imageVersion !== cache?.[item.id?.toString()]?.imageVersion
          };
        });
        cacheService.set(YNCacheKey.JXT, list.reduce((acc, item) => {
          acc[item.id] = item.imageVersion;
          return acc;
        }, cache || {}), StorageType.Persistent);
        return enrichList;
      })
    );
  } else if (entityName ===  Entities.Segments) {
    return httpService.post<EntityRecord[]>(YNAPI_JGSJ.GetList, params || {}, config).pipe(
      map(response => {
        return response?.data || [];
      })
    );
  } else if (entityName === Entities.Operations) {
    return httpService.post<OperationListItem[]>(YNAPI_KZCZ.GetList, params || {}, config).pipe(
      map(response => {
        return response?.data?.map(x => {
          return {id: x.yxId, ...x};
        }) || [];
      })
    );
  } else if (entityName === Entities.LightingControl) {
    return httpService.post<LightingControlRecord[]>(YNAPI_ZMGL.GetList, params || {}, config).pipe(
      map(response => response?.data || [])
    );
  } else if (entityName === Entities.Events) {
    return httpService.post<EventRecord[]>(YNAPI_SJCX.GetEventList, params || {}, config).pipe(
      map(response => {
        return (response.data || []).map((item, index) => {
          const idFromDate = Date.parse(item?.date);
          return {
            ...item,
            id: isNaN(idFromDate) ? index + 1 : idFromDate, //#WIP: API Returan Id;
          };
        });
      })
    );
  }  else {
    const _records: EntityRecord[] = [];
    return of(_records).pipe(delay(0), take(1));
  }
}
