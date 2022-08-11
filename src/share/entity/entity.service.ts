/* eslint-disable no-else-return */
import { delay, Observable, of, take, map } from 'rxjs';
import { httpService, YNAPI_JGSJ, YNAPI_JXT, YNAPI_KZCZ } from '../http';
import { events, lightingControl, operations, realtime, segments, segmentsChild, wirings } from "./data";
import { ControlStatusCode, ControlStatusTextMap } from './data/operations';
import { Entities, EntityRecord, EntityRecordAlias, FormField } from "./entity.types";

export const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const entityMappingTitle: Record<Entities, string> = {
  [Entities.Wirings]: '接线图',
  [Entities.Segments]: '间隔图',
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
    result = events.searchForm;
    break;
  case Entities.Realtime:
    result = realtime.searchForm;
    break;
  case Entities.Segments:
    result = segments.searchForm;
    break;
  case Entities.SegmentsChild:
    result = segmentsChild.searchForm;
    break;
  case Entities.Operations:
    result = operations.searchForm;
    break;
  case Entities.Wirings:
    result = wirings.searchForm;
    break;
  case Entities.LightingControl:
    result = lightingControl.searchForm;
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
}

export function getRecords(entityName: Entities, params?: any): Observable<EntityRecord[]> {
  if ([Entities.SegmentsChild, Entities.Realtime].includes(entityName)) {
    debugger;
    return httpService.post<EntityRecordAlias<FixedModuleRecord>[]>(YNAPI_JGSJ.GetData, params || {}).pipe(
      map(response => {
        //WIP: API
        return response?.data.map(item => {
          return {...item, id: item.index, status: ControlStatusTextMap[item.status]};
        }).filter(x => !!x.name && !!x.status) || [];
      })
    );
  } else {
    if (entityName === Entities.Wirings) {
      return httpService.post<EntityRecord[]>(YNAPI_JXT.GetList).pipe(
        map(response => {
          return response?.data || [];
        })
      );
    } else if (entityName ===  Entities.Segments) {
      return httpService.post<EntityRecord[]>(YNAPI_JGSJ.GetList).pipe(
        map(response => {
          return response?.data || [];
        })
      );
    } else if (entityName === Entities.Operations) {
      return httpService.post<EntityRecord[]>(YNAPI_KZCZ.GetList).pipe(
        map(response => {
          //#WIP: after API Ready remove below sturct changed code 
          const data = response?.data?.map(item => {
            return {
              ...item,
              kfId: item.id,
              khId: item.id,
              id: item.yxId
            };
          });
          return data || [];
        })
      );
    } else {
      const _records: EntityRecord[] = [];
      const startIndex = params?.startIndex || 0;
      const endIndex = params?.endIndex || 20;
      for(let index = startIndex; index < endIndex; index++) {
        const item: EntityRecord = {
          id: index,
          avatar: 'assets/circuit.jpg',
          displayName: `标题 ${entityMappingTitle[entityName]} ${index + 1}`,
          colA:  `字段 ${characters[Math.floor(Math.random() * 10)]}`,
          colB:  `列表项， 描述文本内容`,
          colC:  `${entityName} colC ${index} - ${characters[Math.floor(Math.random() * 10)]}`,
        };
        if ([Entities.LightingControl, Entities.Operations].includes(entityName)) {
          item['controlCol'] = !!(Math.floor(Math.random() * 10) % 2);
        }
        _records.push(item);
      }
      return of(_records).pipe(delay(300), take(1));
    }

  }
}
