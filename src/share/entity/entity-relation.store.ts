import { defineStore } from "pinia";
import { Entities } from "./entity.types";
import { EntityStoreFeature, getEntityRecordStoreId } from "./entity-store-id";

const initialState = { 
  entityName: '', 
  editViewEntityName: Entities.Empty,
};


export function useEntityRelationStore(entityName: Entities) {
  const storeId = getEntityRecordStoreId(entityName, EntityStoreFeature.Relation);
  const store = defineStore(storeId, {
    state: () => {
      return {...initialState, entityName};
    },
  });
  const _store = store();
  return _store;
}
