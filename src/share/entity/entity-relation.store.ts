import { defineStore } from "pinia";
import { Entities } from "./entity.types";
import { EntityStoreFeature, getEntityRecordStoreId } from "./entity-store-id";




export function useEntityRelationStore(entityName: Entities) {
  const storeId = getEntityRecordStoreId(entityName, EntityStoreFeature.Relation);
  const store = defineStore(storeId, {
    state: () => {
      const initialState = { 
        entityName: '', 
        editViewEntityName: Entities.Empty,
      };
      return {...initialState, entityName};
    },
    actions: {
      setEditViewRelateEntity(entityName: Entities) {
        this.$patch({
          editViewEntityName: entityName
        });
      },
      destroy() {
        this.$dispose();
        this.$reset();
      }
    }
  });
  const _store = store();
  return _store;
}
