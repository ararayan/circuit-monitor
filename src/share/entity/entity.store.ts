import { defineStore, Store, _StoreWithGetters } from 'pinia';
import { delay, of, take } from 'rxjs';
import { DataStatus } from '../data.meta';
import { getEditForm$, getSearchForm$ } from './entity.service';
import { Entities, EntityRecord, EntityState, EntityTrackDataType } from './entity.types';




const initialState: EntityState = { 
  entityName: '', 
  records: [],
  searchForm: [],
  editForm: [],
  entityTabs: [],
  isRecordsInited: false,
  editViewEntityName: Entities.Empty,
  pagination: {
    current: 0,
    pageSize: 20,
    total: 10
  },
  meta: {
    records: DataStatus.Unloaded,
    searchForm: DataStatus.Unloaded,
    editForm: DataStatus.Unloaded,
    entityTabs: DataStatus.Unloaded,
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
        if (this.meta[EntityTrackDataType.EntityTabs] === DataStatus.Unloaded) {
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
              meta: {
                [EntityTrackDataType.EntityTabs]: DataStatus.Loaded
              }
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
        if (!this.$state.searchForm.length) {
          getSearchForm$(entityName).subscribe(forms => {
            this.$state.searchForm = forms;
          });
        }
      },
      getEditForm(entityName: Entities) {
        if (!this.$state.editForm.length) {
          getEditForm$(entityName).subscribe(forms => {
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
