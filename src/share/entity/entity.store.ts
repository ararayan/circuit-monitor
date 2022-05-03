import { defineStore, Store, _StoreWithGetters } from 'pinia';
import { delay, of, take } from 'rxjs';
import { DataStatus } from '../data.meta';
import { Entities } from './entity-view-map';

export interface EntityRecord {
    id: number;
    avatar: string;
    displayName: string;
    colA:  string;
    colB:  string;
    [key: string]: any;
}
export interface FormField{
  id: string;
  label: string;
  name: string;
  // input, select, checkbox, radio, range
  as: string; 
  // type: "date" ｜ "datetime-local" ｜ "email" ｜ "month" ｜ "number" ｜ "password" ｜ "search" ｜ "tel" ｜ "text" ｜ "time" ｜ "url" ｜ "week"
  type: string; 
  value: string | number | boolean;
  readonly: boolean;
  disabled: boolean;
  options?: Record<string, string>[];
  rules?: any;
}
export interface EntityTabInfo {
  colName: string;
  id: string;
  value: string;
  displayName: string;
  selected: boolean;
}

export interface EntityState {
    entityName: string;
    editViewEntityName: Entities;
    records: EntityRecord[];
    isRecordsInited: boolean;
    pagination: {current: number; pageSize: number; total: number;},
    entityTabs: EntityTabInfo[];
    entityTabsLoadStatus: DataStatus,
    searchForm: FormField[];
    editForm: FormField[];
}

const initialState: EntityState = { 
  entityName: '', 
  records: [] as EntityRecord[],
  isRecordsInited: false,
  searchForm: []  as FormField[],
  editForm: []  as FormField[],
  editViewEntityName: Entities.Empty,
  entityTabs: [],
  entityTabsLoadStatus: DataStatus.Unloaded,
  pagination: {
    current: 0,
    pageSize: 20,
    total: 10
  }
};

const entityStoreMap = Object.create(null) as {
  [key: string]: Store<string, EntityState, _StoreWithGetters<any>, {
    initEditViewEntity(type: Entities): void;
    getEntityTabs(entityName: Entities): void;
    selectEntityTab(tabId: string): void;
    getRecords(entityName: Entities, data: any): void;
    clearRecords(): void;
    getSearchForm(entityName: Entities): void;
    getEditForm(entityName: Entities): void;
  }>;
};



//#region temp help
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const _fieldAs = ['input', 'checkbox', 'radio', 'textarea']; // select, range
const _fieldInputTypes = [ "text" , "number", "date" , "month" , "email" , "password" , "search" , "tel" , "time" , "url" , "week", "datetime-local" ];
const entityMappingTitle: Record<Entities, string> = {
  [Entities.Wirings]: '接线图',
  [Entities.Segments]: '间隔图',
  [Entities.Realtime]: '实时数据',
  [Entities.Operations]:  '控制操作', 
  [Entities.LightingControl]: '照明管理', 
  [Entities.Events]: '事件查询',
  [Entities.SegmentsChild]: 'NUll',
  [Entities.Empty]: 'NUll',

};
//#endregion

function getWithCreateEntityStore(entityName: string) {
  if(entityStoreMap[entityName]) {
    return entityStoreMap[entityName];
  }
  const store = defineStore(entityName, {
    state: () => {
      return {...initialState, entityName};
    },
    getters: {
      isAllRecordsLoaded: (state) => {
        return state.pagination.current === state.pagination.total;
      }
    },
    actions: {
      initEditViewEntity(entityName: Entities) {
        of(entityName).pipe(take(1)).subscribe(() => {
          if (entityName === Entities.Segments) {
            this.$state.editViewEntityName = Entities.SegmentsChild;
          }else {
            this.$state.editViewEntityName = entityName;
          }

        });
      },
      getEntityTabs(entityName: Entities) {
        if (this.entityTabsLoadStatus === DataStatus.Unloaded) {
          of(entityName).pipe(take(1)).subscribe(() => {
            const tabs = [
              {
                colName: 'colC',
                id: 't1',
                value: 't1',
                displayName: '遙信',
                selected: true
              },
              {
                colName: 'colC',
                id: 't2',
                value: 't2',
                displayName: '遥测',
                selected: false
              },
              {
                colName: 'colC',
                id: 't3',
                value: 't3',
                displayName: '遥脉',
                selected: false
              },
            ];
            this.$patch({
              entityTabs: tabs,
              entityTabsLoadStatus: DataStatus.Loaded
            });
          });
        }
      },
      getRecords(entityName: Entities, data: {init?: boolean, nextPage?: boolean, tabId?: string, search?: Record<string, any>}) {
        //WIP
        // if (this.records.length) {

        // }
        if (data.search || data.init) {
          this.records = [];
          this.pagination.current = 0;
        }
        if (data.nextPage) {
          const _records: EntityRecord[] = [];
          if (this.pagination.current === 10){
            // done;
          }else {
            for(let index = this.pagination.current * this.pagination.pageSize; index < this.pagination.pageSize * (this.pagination.current + 1); index++) {
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
            if (this.pagination.current === 0) {
              of(null).pipe(delay(300), take(1)).subscribe(() => {
                this.$state.records = _records;
                this.pagination.current = this.pagination.current + 1;
              });             
            }else {
              of(null).pipe(delay(1000), take(1)).subscribe(() => {
                this.$state.records = [...this.$state.records, ..._records];
                this.pagination.current = this.pagination.current + 1;
              }); 
            }
            
          }
        }else if ([Entities.SegmentsChild, Entities.Realtime].includes(entityName)) {
          this.$state.records = [];
          this.pagination.current = 0;
          const _records = [] as EntityRecord[];
          for(let index = 0; index < 50; index++) {
            _records.push({
              id: index,
              avatar: 'assets/circuit.jpg',
              displayName: `标题  ${data.tabId === 't1' ? '遙信' :  data.tabId === 't2' ? '遥测' : '遥脉'} ${index + 1}`,
              colA:  `字段 ${characters[Math.floor(Math.random() * 10)]} `,
              colB: `列表项， 描述文本内容`,
              colC: data.tabId === 't1' ? '遙信' :  data.tabId === 't2' ? '遥测' : '遥脉' ,
            } as EntityRecord);
          }
          of(null).pipe(delay(800), take(1)).subscribe(() => {
            this.$state.records = _records;
            this.pagination.current = 1;
          }); 
         
        }else {
          const _records = [];
          for(let index = 0; index < 20; index++) {
            _records.push({
              id: index,
              avatar: 'assets/circuit.jpg',
              displayName: `标题 ${entityMappingTitle[entityName]} ${index + 1}`,
              colA:  `字段 ${characters[Math.floor(Math.random() * 10)]} `,
              colB:  `字段 ${characters[Math.floor(Math.random() * 10)]} `,
              colC:  `列表项， 描述文本内容`,
            } as EntityRecord);
          }
          this.$state.records = _records;
          this.pagination.current = 1;
        }
      },
      clearRecords() {
        this.records = [];
        if (this.pagination) {
          this.pagination.current = 0;
        }

      },
      getSearchForm(entityName: Entities) {
        if (this.$state.searchForm.length) {
          of(entityName).pipe(delay(100), take(1)).subscribe();
        }else {
          const formFieldLabelTest = ['记录名：', '数量：', '生效日期：', '实施中'];
          of(entityName).pipe(delay(100), take(1)).subscribe(() => {
            const forms = Array.from({ length: 4 }).map((_, i) => ({
              id: `col${i}`,
              label: `${formFieldLabelTest[i]}`,
              name: `col${i}`,
              as: i === 3 ? 'checkbox' : 'input',
              type: i === 3 ?  'checkbox' : _fieldInputTypes[i % _fieldInputTypes.length],
              value: i === 3  ?  false : '',
              labelPosition: 'fixed', // fixed, floating, stacked
              rules: {},
              readonly: false,
              disabled: false,
            }));
            this.$state.searchForm = forms;
          });
        }

      },
      getEditForm(entityName: Entities) {
        if (this.$state.editForm.length) {
          of(entityName).pipe(delay(100), take(1)).subscribe();
        }else {
          of(entityName).pipe(delay(100), take(1)).subscribe(() => {
            const forms: FormField[] = [
              {id: 'factoryName', label: '厂站：', name: 'factoryName', as: 'input', type: 'text', value: '临汾铁路', readonly: true, disabled: false, },
              {id: 'description', label: '描述：', name: 'description', as: 'input', type: '', value: '2号主变高后备314_开关操作', readonly: true, disabled: false, },
              {id: 'location', label: '点名：', name: 'location', as: 'input', type: 'text', value: '2号主变高后备314_开关操作',  readonly: true, disabled: false,  },
              {id: 'currentStatus', label: '当前状态：', name: 'currentStatus', as: 'input', type: 'text', value: '信号复归',  readonly: true, disabled: false,  },
              {id: 'controlType', label: '遥控类型：', name: 'currentStatus', as: 'select', type: 'text', value: 'control3',  readonly: false, disabled: false, 
                options: [
                  {id: 'control1', value: '遥控1'},
                  {id: 'control2', value: '遥控2'},
                  {id: 'control3', value: '其它'},
                ]
              },
              {id: 'powerSwitch', label: '对应：', name: 'powerSwitch', as: 'radioGroup', type: '', value: 'open1',  readonly: false, disabled: false,
                options: [
                  {id: 'open1', value: '分闸'},
                  {id: 'close2', value: '合闸'},
                ] },
            ];
            this.$state.editForm = forms;
          });
        }

      },
      selectEntityTab(tabId: string) {
        this.entityTabs.forEach(tab => tab.selected = tab.id === tabId);
      }
    }
  });
  const _store = store();
  entityStoreMap[entityName] = _store;
  return _store;
}

export function destoryEntityStore(entityName: string) {
  const store = entityStoreMap[entityName];
  store?.$dispose();
  delete entityStoreMap[entityName];
}

export function getEntityStore(entityName: string) {
  return getWithCreateEntityStore(entityName);
}
