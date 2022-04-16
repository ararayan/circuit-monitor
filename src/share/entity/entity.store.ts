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

const entityStoreMap = Object.create(null);

export function createEntityStore(entityName: string) {
  if(entityStoreMap[entityName]) {
    return entityStoreMap[entityName] as Store<string, EntityState, any, { getRecords(): void}>;
  }
  const store = defineStore(entityName, {
    state: () => initialState,
    actions: {
      getRecords() {
        //WIP
        const abc = [];
        for(let index = 0; index < 2000; index++) {
          abc.push({
            id: index,
            avatar: 'assets/circuit.jpg',
            displayName: `Title ${index}`,
            colA:  `colA ${index}`,
            colB:  `colB ${index}`,
          } as EntityRecord);
        }
        debugger;
        this.$state.records = abc;
      }
    }
  });
  const _store = store();
  entityStoreMap[entityName] = _store;
  return _store;
}