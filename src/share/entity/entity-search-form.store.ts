import { defineStore } from "pinia";
import { DataStatus } from "../data.meta";
import { Entities, FormField } from "./entity.types";
import { getSearchForm$ } from './entity.service';
import { catchError, of, take } from 'rxjs';
import { EntityStoreFeature, getEntityRecordStoreId } from "./entity-store-id";



export function useEntitySearchFormStore(entityName: Entities) {
  const storeId = getEntityRecordStoreId(entityName, EntityStoreFeature.SearchForm);
  return defineStore(storeId, {
    state: () => {
      const initialState = { 
        entityName: '', 
        searchForm: [] as  FormField[],
        meta: {
          searchForm: DataStatus.Unloaded,
        }
      };
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
      destroy () {
        this.$dispose();
        this.$reset();
      }
    }
  })();
}
