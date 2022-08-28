/* eslint-disable no-else-return */
import { AxiosRequestConfig } from 'axios';
import { delay, Observable, of, take, map } from 'rxjs';
import { httpService, YNAPI_JGSJ, YNAPI_JXT, YNAPI_KZCZ, YNAPI_ZMGL } from '../http';
import { events, lightingControl, operations, realtime, segments, segmentsChild, wirings } from "./data";
import { ControlStatusCode, ControlStatusTextMap } from './data/operations';
import { MixedModuleType } from './entity-tab.store';
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
function getMixedModuleTypeName(type: MixedModuleType) {
  return type === MixedModuleType.Yx ? '遙信' : type === MixedModuleType.Yc ? '遥测' : '遥脉';
}

const status = ['分闸', '合闸', '无效'];
function getRandomStatusText() {
  const index  = Math.floor(Math.random() * 10)%3;
  return status[index];
}

export interface FixedModuleRecord {
  index: number;
  name: string;
  status: ControlStatusCode;
  value: string;
}

export interface LightingControlRecord {
  id: number;
  index: number;
  kfId: number;
  khId: number;
  name: string; //"装置1信号复归"
  yxId: number;
}

export function getRecords(entityName: Entities, params?: any, config?: AxiosRequestConfig): Observable<EntityRecord[]> {
  if ([Entities.SegmentsChild, Entities.Realtime].includes(entityName)) {
    const _records: EntityRecord[] = [];
    const startIndex = params?.startIndex || 0;
    const endIndex = params?.endIndex || 20;
    const mixedModuleTypeName = getMixedModuleTypeName(params.type);

    for(let index = startIndex; index < endIndex; index++) {
      const item: EntityRecord = {
        id: index,
        name: `装置${index + 1} - ${mixedModuleTypeName} ${index + 1}`,
        note:  `节点数：${index}`,
        desc:  `${getRandomStatusText()}`,
      };
      _records.push(item);
    }
    return of(_records).pipe(delay(100), take(1));
  } else {
    if (entityName === Entities.Wirings) {
      const _records: EntityRecord[] = [];
      const startIndex = params?.startIndex || 0;
      const endIndex = params?.endIndex || 20;
      for(let index = startIndex; index < endIndex; index++) {
        const kv = Math.floor(Math.random() * 10 *(Math.floor(Math.random() * 10)%3 + 1));
        const count = Math.floor(Math.random() * 10);
        const item: EntityRecord = {
          id: index,
          avatar: 'assets/wiring/circuit.jpg',
          name: ` 衍能云管理系统 ${kv} KV`,
          note:  `节点数：${count}`,
          desc:  `接线图描述文本内容-${index}`,
          colC:  `${entityName} colC ${index} - ${characters[Math.floor(Math.random() * 10)]}`,
        };
        // if ([Entities.LightingControl, Entities.Operations].includes(entityName)) {
        //   item['controlCol'] = !!(Math.floor(Math.random() * 10) % 2);
        // }
        _records.push(item);
      }
      return of(_records).pipe(delay(100), take(1));
    } else if (entityName ===  Entities.Segments) {
      const _records: EntityRecord[] = [];
      const startIndex = params?.startIndex || 0;
      const endIndex = params?.endIndex || 20;
      for(let index = startIndex; index < endIndex; index++) {
        const kv = Math.floor(Math.random() * 10 *(Math.floor(Math.random() * 10)%3 + 1));
        const count = Math.floor(Math.random() * 10);
        const item: EntityRecord = {
          id: index,
          avatar: 'assets/wiring/circuit.jpg',
          name: ` 衍能测试间隔 ${kv} KV`,
          note:  `节点数：${count}`,
          desc:  `接线图描述文本内容-${index}`,
          colC:  `${entityName} colC ${index} - ${characters[Math.floor(Math.random() * 10)]}`,
        };
        _records.push(item);
      }
      return of(_records).pipe(delay(100), take(1));
    } else if (entityName === Entities.Operations) {
      const _records: EntityRecord[] = [];
      const startIndex = params?.startIndex || 0;
      const endIndex = params?.endIndex || 20;
      const texts = ['过流反时限软压板', '过流加速段软压板', '零序1段软压板', '零序2段软压板', '过负荷软压板', '开关操作', '接地试跳', '信号复归', '过流节点1控制', '过流节点2控制'];
      for(let index = startIndex; index < endIndex; index++) {
        const textIndex = Math.floor(Math.random() * 10)%10;
        const item: EntityRecord = {
          id: index,
          name: `装置${index + 1} ${texts[textIndex]}`,
        };
        _records.push(item);
      }
      return of(_records).pipe(delay(100), take(1));
    } else if (entityName === Entities.LightingControl) {
      const _records: EntityRecord[] = [];
      const startIndex = params?.startIndex || 0;
      const endIndex = params?.endIndex || 20;
      const codes = [ControlStatusCode.Fen, ControlStatusCode.He, ControlStatusCode.Wx];
      const texts = ['过流反时限软压板', '过流加速段软压板', '零序1段软压板', '零序2段软压板', '过负荷软压板', '开关操作', '接地试跳', '信号复归', '过流节点1控制', '过流节点2控制'];
      for(let index = startIndex; index < endIndex; index++) {
        const textIndex = Math.floor(Math.random() * 10)%10;
        const codeIndex = Math.floor(Math.random() * 10)%3;
        const item: EntityRecord = {
          id: index,
          name: `装置${index + 1} ${texts[textIndex]}`,
          status: codes[codeIndex]
        };
        _records.push(item);
      }
      return of(_records).pipe(delay(100), take(1));
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
