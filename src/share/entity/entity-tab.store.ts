// import { defineStore, Store, _StoreWithGetters } from 'pinia';
// import { catchError, delay, of, take } from 'rxjs';
// import { DataStatus } from '../data.meta';
// import { getEditForm$, getSearchForm$ } from './entity.service';
// import { Entities, EntityRecord, EntityState, EntityTrackDataType } from './entity.types';


// const tabInitialState = {
//   tabId: '',
//   entityName: '', 
//   records: [],
//   meta: {
//     records: DataStatus.Unloaded,
//     searchForm: DataStatus.Unloaded,
//     editForm: DataStatus.Unloaded,
//     entityTabs: DataStatus.Unloaded,
//   }
// };


// const initialState: EntityState = {
//   entityName: '', 
//   tabId: '',
//   records: [],
//   searchForm: [],
//   editForm: [],
//   entityTabs: [],
//   editViewEntityName: Entities.Empty,
//   pagination: {
//     current: 0,
//     pageSize: 20,
//     total: 10
//   },
//   meta: {
//     records: DataStatus.Unloaded,
//     searchForm: DataStatus.Unloaded,
//     editForm: DataStatus.Unloaded,
//     entityTabs: DataStatus.Unloaded,
//   }
// };

// const entityTabStoreMap = Object.create(null) as {
//   [key: string]: Store<string, EntityState, _StoreWithGetters<any>, {
//     // getEntityTabs(entityName: Entities): void;
//     // selectEntityTab(tabId: string): void;
//     // getRecords(entityName: Entities, data: any): void;
//     // clearRecords(): void;
//     // getSearchForm(entityName: Entities): void;
//     // getEditForm(entityName: Entities): void;
//   }>;
// };

// function getAndCreateEntityTabStore(tabId: string) {
//   if(entityTabStoreMap[tabId]) {
//     return entityTabStoreMap[tabId];
//   }
//   const store = defineStore(tabId, {
//     state: () => {
//       return {...initialState};
//     },
//     actions: {
//       // search form -> search -> reGet all entity records, recover pagination status
//       // init entity browse view -> init get entity records, default get page 1
//       // push to load next page -> get entity records, load the nect page;
//       // get entity list -> filter by tabid ->
//       getRecords(entityName: Entities, tabId: string, page?: number) {

//       },
//       clearRecords() {
//         this.records = [];
//         if (this.pagination) {
//           this.pagination.current = 0;
//         }

//       },
//       getEntityTabs(entityName: Entities) {
//         if (![DataStatus.Loaded, DataStatus.Loading].includes(this.$state.meta[EntityTrackDataType.EntityTabs])) {
//           of(entityName).pipe(take(1)).subscribe(() => {
//             const tabs = [
//               {
//                 colName: 'colC',
//                 id: 't1',
//                 value: 't1',
//                 displayName: '遙信',
//                 selected: true
//               },
//               {
//                 colName: 'colC',
//                 id: 't2',
//                 value: 't2',
//                 displayName: '遥测',
//                 selected: false
//               },
//               {
//                 colName: 'colC',
//                 id: 't3',
//                 value: 't3',
//                 displayName: '遥脉',
//                 selected: false
//               },
//             ];
//             this.$patch({
//               [EntityTrackDataType.EntityTabs]: tabs,
//               meta: {
//                 [EntityTrackDataType.EntityTabs]: DataStatus.Loaded
//               }
//             });
//           });
//         }
//       },
//       getSearchForm(entityName: Entities) {
//         if (![DataStatus.Loaded, DataStatus.Loading].includes(this.$state.meta[EntityTrackDataType.SearchForm])) {
//           getSearchForm$(entityName).pipe(
//             catchError(err => {
//               this.$patch({
//                 meta: {
//                   [EntityTrackDataType.SearchForm]: DataStatus.Error
//                 }
//               });
//               return of(err);
//             }),
//             take(1),
//           ).subscribe(forms => {
//             this.$patch({
//               [EntityTrackDataType.SearchForm]: forms,
//               meta: {
//                 [EntityTrackDataType.SearchForm]: DataStatus.Loaded
//               }
//             });
//           });
//         }
//       },
//       getEditForm(entityName: Entities) {
//         if (![DataStatus.Loaded, DataStatus.Loading].includes(this.$state.meta[EntityTrackDataType.EditForm])){
//           getEditForm$(entityName).pipe(
//             catchError(err => {
//               this.$patch({
//                 meta: {
//                   [EntityTrackDataType.EditForm]: DataStatus.Error
//                 }
//               });
//               return of(err);
//             }),
//             take(1),
//           ).subscribe(forms => {
//             this.$patch({
//               [EntityTrackDataType.EditForm]: forms,
//               meta: {
//                 [EntityTrackDataType.EditForm]: DataStatus.Loaded
//               }
//             });
//           });
//         }
//       },
//       selectEntityTab(tabId: string) {
//         this.entityTabs.forEach(tab => tab.selected = tab.id === tabId);
//       }
//     }
//   });
//   const _store = store();
//   entityStoreMap[entityName] = _store;
//   return _store;
// }



// export function destoryEntityStore(tabId: string) {
//   const store = entityTabStoreMap[tabId];
//   store?.$dispose();
//   delete entityTabStoreMap[tabId];
// }

// export function getEntityTabStore(tabId: string) {
//   return getAndCreateEntityTabStore(tabId);
// }
