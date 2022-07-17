import { defineStore } from "pinia";
import { DataStatus } from "../data.meta";
import { Entities, EntityRecord, FormField } from "./entity.types";
import { getEditForm$ } from './entity.service';
import { catchError, of, take } from 'rxjs';


const StoreAffix_Record = 'record';

function getEntityRecordStoreId(entityName: Entities) {
  return `${entityName}_${StoreAffix_Record}`;
}

const initialState = { 
  entityName: '', 
  editForm: [] as  FormField[],
  meta: {
    editForm: DataStatus.Unloaded,
  }
};

export function useEntityEditFormStore(entityName: Entities) {
  const storeId = getEntityRecordStoreId(entityName);
  return defineStore(storeId, {
    state: () => {
      return {...initialState, entityName};
    },
    actions: {
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
    }
  })();
}
