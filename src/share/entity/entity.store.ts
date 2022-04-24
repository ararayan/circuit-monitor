import { defineStore, Store } from 'pinia';

export interface EntityRecord {
    id: number;
    avatar: string;
    displayName: string;
    colA:  string;
    colB:  string;
}
export interface FormField{
  id: string;
  label: string;
  type: string;
}

export interface EntityState {
    records: EntityRecord[],
    searchForm: FormField[],
}

const initialState: EntityState = { records: [] as EntityRecord[], searchForm: []  as FormField[]};

const entityStoreMap = Object.create(null) as {
  [key: string]: Store<string, EntityState, any, {
    getRecords(entityName: string, data: any): void
    getSearchForm(entityName: string): void
  }>
};

function getWithCreateEntityStore(entityName: string) {
  if(entityStoreMap[entityName]) {
    return entityStoreMap[entityName];
  }
  const store = defineStore(entityName, {
    state: () => {
      return {...initialState, entityName};
    },
    actions: {
      getRecords(entityName: string, data: any) {
        //WIP
        const abc = [];
        for(let index = (data.page - 1) * 20; index < 20 * data.page; index++) {
          abc.push({
            id: index,
            avatar: 'assets/circuit.jpg',
            displayName: `Title ${index}`,
            colA:  `colA ${index}`,
            colB:  `colB ${index}`,
          } as EntityRecord);
        }
        this.$state.records.push(...abc);
      },
      getSearchForm(entityName: string) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const forms = Array.from({ length: 4 }).map((_, i) => ({
          id: `col1${i}`,
          label: `search col ${characters[i]}:`,
          type: Math.random() * 10 > 5 ? 'text' : 'dateTime',
        }));
        this.$state.searchForm.push(...forms);
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
}

export function getEntityStore(entityName: string) {
  return getWithCreateEntityStore(entityName);
}