import { defineStore } from "pinia";
import { DataStatus } from "../data.meta";
import { Entities, EntityRecord } from "./entity.types";
import { getRecords } from './entity.service';
import { EntityStoreFeature, getEntityRecordStoreId } from "./entity-store-id";

const initialState = { 
  entityName: '', 
  records: [] as EntityRecord[],
  prevPool: [] as EntityRecord[],
  nextPool: [] as EntityRecord[],
  pagination: {
    current: 1,
    pageSize: 20,
    cacheRadius: 1,
  },
  meta: {
    records: DataStatus.Unloaded,
  }
};


export function useEntityRecordsStore(entityName: Entities) {
  const storeId = getEntityRecordStoreId(entityName, EntityStoreFeature.Record);
  return defineStore(storeId, {
    state: () => {
      return {...initialState, entityName};
    },
    actions: {
      // getPreviousRecords
      getRecords(entityName: Entities, params: { criteria?: Record<string, any>, isInit?: boolean, forward?: boolean}) {
        const { criteria, isInit } = params;
        if (isInit) {
          this.$patch({
            records: [],
            pagination: {
              current: 0,
            },
            meta: {
              records: DataStatus.Loading
            }
          });
        }else {
          this.$patch({
            meta: {
              records: DataStatus.Loading
            }
          });
        }
        const queryPageIndex = isInit ? 1 : this.pagination.current + 1;
        getRecords(entityName, criteria || {}, {current: queryPageIndex, pageSize: this.pagination.pageSize}).subscribe(result => {
          // split 
          queryPageIndex + this.pagination.cacheRadius;
          this.$patch({
            records: [...this.records, ...(result || [])],
            pagination: {
              current: queryPageIndex
            },
            meta: {
              records: DataStatus.Loaded
            }
          });
        });
      },
      clearRecords() {
        this.$patch({
          records: [],
          prevPool: [],
          nextPool: [],
          pagination: {
            current: 0,
            pageSize: 20,
            cacheRadius: 1
          },
          meta: {
            records: DataStatus.Unloaded
          }
        });  
      },
    }
  })();
}
