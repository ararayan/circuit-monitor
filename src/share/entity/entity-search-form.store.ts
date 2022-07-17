import { defineStore } from "pinia";
import { DataStatus } from "../data.meta";
import { Entities, EntityRecord, FormField } from "./entity.types";
import { getSearchForm$ } from './entity.service';
import { catchError, of, take } from 'rxjs';


const StoreAffix_Record = 'record';

function getEntityRecordStoreId(entityName: Entities) {
  return `${entityName}_${StoreAffix_Record}`;
}

const initialState = { 
  entityName: '', 
  searchForm: [] as  FormField[],
  meta: {
    searchForm: DataStatus.Unloaded,
  }
};

export function useEntitySearchFormStore(entityName: Entities) {
  const storeId = getEntityRecordStoreId(entityName);
  return defineStore(storeId, {
    state: () => {
      return {...initialState, entityName};
    },
    actions: {
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
    }
  })();
}
