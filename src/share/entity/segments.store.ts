import { defineStore } from 'pinia';
import { catchError, delay, of, take } from 'rxjs';
import { DataStatus } from '../data.meta';
import { getEditForm$, getSearchForm$ } from './entity.service';
import { characters, entityMappingTitle } from './entity.store';
import { Entities, EntityBaseTrackData, EntityRecord } from './entity.types';




const initialState: EntityBaseTrackData = { 
  entityName: '', 
  records: [],
  searchForm: [],
  editForm: [],
  editViewEntityName: Entities.SegmentsChild,
  pagination: {
    current: 0,
    pageSize: 20,
    total: 10
  },
  meta: {
    records: DataStatus.Unloaded,
    searchForm: DataStatus.Unloaded,
    editForm: DataStatus.Unloaded,
  }
};

//#endregion

const segmentsStore = defineStore(Entities.Segments, {
  state: () => initialState,
  actions: {
    getRecords(entityName: Entities, data: {init?: boolean, nextPage?: boolean, tabId?: string, search?: Record<string, any>}) {
      if (data.search || data.init) {
        this.records = [];
        this.pagination.current = 0;
      }
      if (data.nextPage) {
        const _records: EntityRecord[] = [];
        if (this.pagination.current === 10){
          // done;
        } else {
          for(let index = this.pagination.current * this.pagination.pageSize; index < this.pagination.pageSize * (this.pagination.current + 1); index++) {
            const item: EntityRecord = {
              id: index,
              avatar: 'assets/circuit.jpg',
              displayName: `标题 ${entityMappingTitle[Entities.Segments]} ${index + 1}`,
              colA:  `字段 ${characters[Math.floor(Math.random() * 10)]}`,
              colB:  `列表项， 描述文本内容`,
              colC:  `${entityName} colC ${index} - ${characters[Math.floor(Math.random() * 10)]}`,
            };
            _records.push(item);
          }
          if (this.pagination.current === 0) {
            of(null).pipe(delay(300), take(1)).subscribe(() => {
              this.$state.records = _records;
              this.pagination.current = this.pagination.current + 1;
            });             
          }else {
            of(null).pipe(delay(1000), take(1)).subscribe(() => {
              this.$state.records = [...this.$state.records, ..._records];
              this.pagination.current = this.pagination.current + 1;
            }); 
          }
          
        }
      }else {
        const _records = [];
        for(let index = 0; index < 20; index++) {
          _records.push({
            id: index,
            avatar: 'assets/circuit.jpg',
            displayName: `标题 ${entityMappingTitle[entityName]} ${index + 1}`,
            colA:  `字段 ${characters[Math.floor(Math.random() * 10)]} `,
            colB:  `字段 ${characters[Math.floor(Math.random() * 10)]} `,
            colC:  `列表项， 描述文本内容`,
          } as EntityRecord);
        }
        this.$state.records = _records;
        this.pagination.current = 1;
      }
    },
    clearRecords() {
      this.records = [];
      if (this.pagination) {
        this.pagination.current = 0;
      }
    },
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
});

export {
  segmentsStore
};
