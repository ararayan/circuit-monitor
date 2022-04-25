import { defineStore, Store, _StoreWithGetters } from 'pinia';
import { delay, of, take } from 'rxjs';
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
  rules: any;
  value: any;
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
    pagination: {current: number; pageSize: number; total: number;},
    entityTabs: EntityTabInfo[];
    searchForm: FormField[];
}

const initialState: EntityState = { 
  entityName: '', 
  records: [] as EntityRecord[],
  searchForm: []  as FormField[],
  editViewEntityName: Entities.Empty,
  entityTabs: [],
  pagination: {
    current: 1,
    pageSize: 20,
    total: 10
  }
};

const entityStoreMap = Object.create(null) as {
  [key: string]: Store<string, EntityState, _StoreWithGetters<any>, {
    initEditViewEntity(type: Entities): void;
    initEntityTabs(entityName: Entities): void;
    getRecords(entityName: Entities, data: any): void;
    getSearchForm(entityName: Entities): void;
  }>
};

//#region temp help
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const _fieldAs = ['input', 'checkbox', 'radio']; // select, range
const _fieldInputTypes = [ "text" , "number", "date" , "month" , "email" , "password" , "search" , "tel" , "time" , "url" , "week", "datetime-local" ];
//#endregion

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
      getRecords(entityName: Entities, data: {init?: boolean, nextPage?: boolean, tabId?: string, search?: Record<string, any>}) {
        //WIP
        if (data.search || data.init) {
          this.records = [];
          this.pagination.current = 1;
        }
        if (data.nextPage) {
          const abc = [];
          if (this.pagination.current === 10){
            // done;
          }else {
            for(let index = (this.pagination.current - 1) * this.pagination.pageSize; index < this.pagination.pageSize * this.pagination.current; index++) {
              abc.push({
                id: index,
                avatar: 'assets/circuit.jpg',
                displayName: `${entityName} Title ${index}`,
                colA:  `${entityName} colA ${index} - ${characters[Math.floor(Math.random() * 10)]}`,
                colB:  `${entityName} colB ${index} - ${characters[Math.floor(Math.random() * 10)]}`,
                colC:  `${entityName} colC ${index} - ${characters[Math.floor(Math.random() * 10)]}`,
              } as EntityRecord);
            }
            if (this.pagination.current === 1) {
              this.$state.records = abc;
            }else {
              this.$state.records.push(...abc);
            }
            this.pagination.current = this.pagination.current + 1;
          }
        }else if (entityName === Entities.SegmentsChild) {
          const eee = [];
          for(let index = 0; index < 50; index++) {
            eee.push({
              id: index,
              avatar: 'assets/circuit.jpg',
              displayName: `Title ${index}`,
              colA:  `colA ${index} - ${characters[Math.floor(Math.random() * 10)]} `,
              colB:  `colB ${index} - ${characters[Math.floor(Math.random() * 10)]}`,
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
        if (this.$state.searchForm.length) {
          of(entityName).pipe(delay(100), take(1)).subscribe();
        }else {
          of(entityName).pipe(delay(100), take(1)).subscribe(() => {
            const forms = Array.from({ length: 4 }).map((_, i) => ({
              id: `col${i}`,
              label: `search ${characters[i].toLocaleLowerCase()}:`,
              name: `col${i}`,
              as: i === 3 ? 'checkbox' : 'input',
              type: i === 3 ?  'checkbox' : _fieldInputTypes[i % _fieldInputTypes.length],
              value: i === 3  ?  false : '',
              rules: {}
            }));
            this.$state.searchForm.push(...forms);
          });
        }

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