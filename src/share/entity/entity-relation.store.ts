import { defineStore } from "pinia";
import { Entities } from "./entity.types";

const initialState = { 
  entityName: '', 
  editViewEntityName: Entities.Empty,
};


export function useEntityRelationStore(entityName: Entities, tabId: string) {
  const store = defineStore(tabId, {
    state: () => {
      return {...initialState, entityName};
    },
  });
  const _store = store();
  return _store;
}
