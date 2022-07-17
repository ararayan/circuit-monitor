import { defineStore } from "pinia";
import { DataStatus } from "../data.meta";
import { Entities, EntityRecord } from "./entity.types";
import { getRecords } from './entity.service';

const StoreAffix_Record = 'record';

function getEntityRecordStoreId(entityName: Entities) {
  return `${entityName}_${StoreAffix_Record}`;
}

const initialState = { 
  entityName: '', 
  records: [] as EntityRecord[],
  pagination: {
    current: 0,
    pageSize: 20,
    total: 1
  },
  meta: {
    records: DataStatus.Unloaded,
  }
};


export function useEntityRecordsStore(entityName: Entities) {
  const storeId = getEntityRecordStoreId(entityName);
  return defineStore(storeId, {
    state: () => {
      return {...initialState, entityName};
    },
    actions: {
      getRecords(entityName: Entities, params: { criteria?: Record<string, any>, pageIndex?: number}) {
        this.$patch({
          meta: {
            records: DataStatus.Loading
          }
        });
        let { criteria, pageIndex } = params;
        criteria = criteria || {};
        pageIndex = pageIndex === undefined ? 1 : pageIndex;
        getRecords(entityName, criteria, {current: pageIndex || this.pagination.current + 1, pageSize: this.pagination.pageSize}).subscribe(result => {
          this.$patch({
            records: [...this.records, ...(result || [])],
            pagination: {
              current: pageIndex || this.pagination.current + 1
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
          pagination: {
            current: 0,
            pageSize: 20,
            total: 1
          },
          meta: {
            records: DataStatus.Unloaded
          }
        });  
      },
    }
  })();
}
