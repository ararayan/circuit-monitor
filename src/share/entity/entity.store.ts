import { defineStore, Store } from 'pinia';

export interface EntityRecord {
    id: number;
    avatar: string;
    displayName: string;
    colA:  string;
    colB:  string;
}

export interface EntityState {
    records: EntityRecord[]
}

const initialState: EntityState = { records: [] as EntityRecord[] };

const entityStoreMap = Object.create(null) as {
  [key: string]: Store<string, EntityState, any, {
    getRecords(entityName: string, data: any): void
  }>
};

export function createEntityStore(entityName: string) {
  if(entityStoreMap[entityName]) {
    return entityStoreMap[entityName];
  }
  const store = defineStore(entityName, {
    state: () => initialState,
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