import { Entities, EntityRecord, FormField } from "./entity.types";
import { catchError, delay, of, take } from 'rxjs';
import { events, lightingControl, operations, realtime, segments, segmentsChild, wirings } from "./data";
import { characters, entityMappingTitle } from "./entity.store";


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
    result = operations.editForm;
    break;
  default:
    break;
  }
  return of(result);
}

export function getRecords(entityName: Entities, criteria?: any, pagination?: {current: number, pageSize: number}) {
  const _records: EntityRecord[] = [];
  if (pagination) {
    if ([Entities.SegmentsChild, Entities.Realtime].includes(entityName)) {
      for(let index = 0; index < 50; index++) {
        _records.push({
          id: index,
          avatar: 'assets/circuit.jpg',
          displayName: `标题  ${criteria.tabId === 't1' ? '遙信' :  criteria.tabId === 't2' ? '遥测' : '遥脉'} ${index + 1}`,
          colA:  `字段 ${characters[Math.floor(Math.random() * 10)]} `,
          colB: `列表项， 描述文本内容`,
          colC: criteria.tabId === 't1' ? '遙信' :  criteria.tabId === 't2' ? '遥测' : '遥脉' ,
        } as EntityRecord);
      }
    }else {
      for(let index = pagination.current * pagination.pageSize; index < pagination.pageSize * (pagination.current + 1); index++) {
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
    }
  }

  return of(_records).pipe(delay(300), take(1));
}
