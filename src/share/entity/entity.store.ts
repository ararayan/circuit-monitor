import { defineStore, Store, _StoreWithGetters } from 'pinia';
import { catchError, of, take } from 'rxjs';
import { DataStatus } from '../data.meta';
import { getEditForm$, getRecords, getSearchForm$ } from './entity.service';
import { Entities, EntityBaseTrackData } from './entity.types';
import { segmentsStore } from './segments.store';



const initialState: EntityBaseTrackData = { 
  entityName: '', 
  records: [],
  searchForm: [],
  editForm: [],
  // entityTabs: [],
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
    // entityTabs: DataStatus.Unloaded,
  }
};

type BaseEntityStoreDefinition<A = object> = Store<string, EntityBaseTrackData, _StoreWithGetters<any>, {
  getRecords(entityName: Entities, data: any): void;
  clearRecords(): void;
  getSearchForm(entityName: Entities): void;
  getEditForm(entityName: Entities): void;
  // getEntityTabs?(entityName: Entities): void;
  // selectEntityTab?(tabId: string): void;
} & { [P in keyof A]: A[P] } >;

const entityStoreMap = Object.create(null) as {
  [key: string]: BaseEntityStoreDefinition;
};



//#region temp help
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
//#endregion


function getWithCreateEntityStore(entityName: Entities) {
  if(entityStoreMap[entityName]) {
    return entityStoreMap[entityName];
  }
  let _entityStore: BaseEntityStoreDefinition;
  switch(entityName) {
  case Entities.Segments:
    debugger;
    _entityStore = segmentsStore();
    break;
  default: 
    _entityStore = defineStore(entityName, {
      state: () => initialState,
      actions: {
        getRecords(entityName: Entities, criteria?: Record<string, any>, pageIndex?: number) {
          this.$patch({
            meta: {
              records: DataStatus.Loading
            }
          });
          getRecords(entityName, criteria, {current: pageIndex || this.pagination.current + 1, pageSize: this.pagination.pageSize}).subscribe(result => {
            this.$patch({
              records: [...this.records, ...(result || [])],
              pagination: {
                current: pageIndex || this.pagination.current + 1
              },
              meta: {
                records: DataStatus.Loaded
              }
            });
          });
        },
        clearRecords() {
          this.records = [];
          if (this.pagination) {
            this.pagination.current = 0;
          }
    
        },
        getSearchForm(entityName: Entities) {
          if (![DataStatus.Loaded, DataStatus.Loading].includes(this.$state.meta.searchForm)) {
            getSearchForm$(entityName).pipe(
              catchError(err => {
                this.$patch({
                  meta: {
                    searchForm: DataStatus.Error
                  }
                });
                return of(err);
              }),
              take(1),
            ).subscribe(forms => {
              this.$patch({
                searchForm: forms,
                meta: {
                  searchForm: DataStatus.Loaded
                }
              });
            });
          }
        },
        getEditForm(entityName: Entities) {
          if (![DataStatus.Loaded, DataStatus.Loading].includes(this.$state.meta.editForm)){
            getEditForm$(entityName).pipe(
              catchError(err => {
                this.$patch({
                  meta: {
                    editForm: DataStatus.Error
                  }
                });
                return of(err);
              }),
              take(1),
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
        // getEntityTabs(entityName: Entities) {
        //   if (![DataStatus.Loaded, DataStatus.Loading].includes(this.$state.meta.entityTabs)) {
        //     of(entityName).pipe(take(1)).subscribe(() => {
        //       const tabs = [
        //         {
        //           colName: 'colC',
        //           id: 't1',
        //           value: 't1',
        //           displayName: '遙信',
        //           selected: true
        //         },
        //         {
        //           colName: 'colC',
        //           id: 't2',
        //           value: 't2',
        //           displayName: '遥测',
        //           selected: false
        //         },
        //         {
        //           colName: 'colC',
        //           id: 't3',
        //           value: 't3',
        //           displayName: '遥脉',
        //           selected: false
        //         },
        //       ];
        //       this.$patch({
        //         entityTabs: tabs,
        //         meta: {
        //           entityTabs: DataStatus.Loaded
        //         }
        //       });
        //     });
        //   }
        // },
        // selectEntityTab(tabId: string) {
        //   this.entityTabs.forEach(tab => tab.selected = tab.id === tabId);
        // }
      }
    })();
    break;
  }

  entityStoreMap[entityName] = _entityStore;
  return _entityStore;
}

export function destoryEntityStore(entityName: Entities) {
  const store = entityStoreMap[entityName];
  store?.$dispose();
  delete entityStoreMap[entityName];
}

export function getEntityStore(entityName: Entities) {
  return getWithCreateEntityStore(entityName);
}
