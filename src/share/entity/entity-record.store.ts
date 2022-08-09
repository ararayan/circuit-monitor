import { defineStore } from "pinia";
import { DataStatus } from "../data.meta";
import { Entities, EntityRecord } from "./entity.types";
import { getRecords } from './entity.service';
import { EntityStoreFeature, getEntityRecordStoreId } from "./entity-store-id";
import { Subject } from "rxjs";




export function useEntityRecordsStore(entityName: Entities) {
  const storeId = getEntityRecordStoreId(entityName, EntityStoreFeature.Record);
  const destory$ = new Subject<boolean>();
  const initialState = {
    entityName: '',
    records: [] as EntityRecord[],
    openRecordId: '',
    pagination: {
      current: 1,
      pageSize: 20
    },
    meta: {
      records: DataStatus.Unloaded,
    }
  };
  return defineStore(storeId, {
    state: () => {
      return { ...initialState, entityName };
    },
    actions: {
      // getPreviousRecords
      getRecords(entityName: Entities, params: { criteria?: Record<string, any>, isInit?: boolean, hasPagination?: boolean}) {
        const { criteria, isInit, hasPagination } = params;
        if (isInit && hasPagination) {
          this.$patch({
            records: [],
            pagination: {
              current: 0,
              pageSize: 20,
            },
            meta: {
              records: DataStatus.Loading
            }
          });
        } else {
          this.$patch({
            meta: {
              records: DataStatus.Loading
            }
          });
        }
        const queryPageIndex = isInit ? 1 : this.pagination.current + 1;
        const postData = hasPagination 
          ? { ...criteria, startIndex: (queryPageIndex - 1) * this.pagination.pageSize, endIndex: queryPageIndex * this.pagination.pageSize }
          : { ...criteria };
        getRecords(entityName, postData).subscribe(result => {
          // split 
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
      getRecrod(recordId: string) {
        return this.records.find(x => x.id.toString() === recordId) as EntityRecord;
      },
      clearRecords() {
        this.$patch({
          records: [],
          pagination: {
            current: 0,
            pageSize: 20
          },
          meta: {
            records: DataStatus.Unloaded
          }
        });
      },
      setOpenRecord(recordId: string | number) {
        this.$patch({
          openRecordId: recordId.toString(),
        });

      },
      destroy() {
        destory$.next(true);
        destory$.complete();

        // fix: pinia.state will cache state even the store instance was remove by call self dispose;
        // manual call reset make cahce state backto inital status; more detail see the state fn on below;
        this.$reset();
        this.$dispose();
      }
    }
  })();
}
