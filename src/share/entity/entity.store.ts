import { defineStore, Store, _StoreWithGetters } from 'pinia';
import { of, take } from 'rxjs';
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
  type: string;
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
    entityTabs: EntityTabInfo[];
    searchForm: FormField[];
}

const initialState: EntityState = { entityName: '',  records: [] as EntityRecord[], searchForm: []  as FormField[], editViewEntityName: Entities.Empty, entityTabs: []};

const entityStoreMap = Object.create(null) as {
  [key: string]: Store<string, EntityState, _StoreWithGetters<any>, {
    initEditViewEntity(type: Entities): void;
    initEntityTabs(entityName: Entities): void;
    getRecords(entityName: Entities, data: any): void;
    getSearchForm(entityName: Entities): void;
  }>
};

function getWithCreateEntityStore(entityName: string, customGetters?: _StoreWithGetters<any>) {
  if(entityStoreMap[entityName]) {
    return entityStoreMap[entityName];
  }
  const store = defineStore(entityName, {
    state: () => {
      return {...initialState, entityName};
    },
    getters: customGetters ? Object.keys(customGetters).reduce((acc, key) => {
      customGetters[key].bind(acc);
      return acc;
    }, {} as _StoreWithGetters<any>) : {},
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
      initEntityTabs(entityName: Entities) {
        of(entityName).pipe(take(1)).subscribe(() => {
          this.entityTabs = [
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
        });
      },
      getRecords(entityName: Entities, data: any) {
        //WIP
        if (data.page) {
          const abc = [];
          for(let index = (data.page - 1) * 20; index < 20 * data.page; index++) {
            abc.push({
              id: index,
              avatar: 'assets/circuit.jpg',
              displayName: `${entityName} Title ${index}`,
              colA:  `${entityName} colA ${index}`,
              colB:  `${entityName} colB ${index}`,
              colC:  `${entityName} colC ${index}`,
            } as EntityRecord);
          }
          this.$state.records.push(...abc);
        }else if (entityName === Entities.SegmentsChild) {
          const eee = [];
          for(let index = 0; index < 50; index++) {
            eee.push({
              id: index,
              avatar: 'assets/circuit.jpg',
              displayName: `Title ${index}`,
              colA:  `colA ${index}`,
              colB:  `colB ${index}`,
              colC: data.tabId === 't1' ? '遙信' :  data.tabId === 't2' ? '遥测' : '遥脉' ,
            } as EntityRecord);
          }
          this.$state.records = eee;
        }else {
          const eee = [];
          for(let index = 0; index < 20; index++) {
            eee.push({
              id: index,
              avatar: 'assets/circuit.jpg',
              displayName: `${entityName} Title ${index}`,
              colA:  `${entityName} colA ${index}`,
              colB:  `${entityName} colB ${index}`,
              colC:  `${entityName} colC ${index}`, 
            } as EntityRecord);
          }
          this.$state.records = eee;
        }

        
      },
      getSearchForm(entityName: Entities) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        of(entityName).pipe(take(1)).subscribe(() => {
          const forms = Array.from({ length: 4 }).map((_, i) => ({
            id: `col1${i}`,
            label: `search col ${characters[i]}:`,
            type: Math.random() * 10 > 5 ? 'text' : 'dateTime',
          }));
          this.$state.searchForm.push(...forms);
        });
      },
    }
  });
  const _store = store();
  entityStoreMap[entityName] = _store;
  return _store;
}

export function destoryEntityStore(entityName: string) {
  const store = entityStoreMap[entityName];
  store?.$dispose();
}

export function getEntityStore(entityName: string) {
  return getWithCreateEntityStore(entityName);
}