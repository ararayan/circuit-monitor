import { defineStore } from 'pinia';
import { of, take } from 'rxjs';
import { DataStatus } from '../data.meta';
import { Entities, EntityTabInfo } from './entity.types';





const initialState = {
  entityName: '', 
  tabId: '',
  entityTabs: [] as EntityTabInfo[],
  meta: {
    entityTabs: DataStatus.Unloaded,
  }
};



export function useEntityTabStore(entityName: Entities, tabId: string) {
  const store = defineStore(tabId, {
    state: () => {
      return {...initialState, entityName};
    },
    actions: {
      getEntityTabs(entityName: Entities) {
        if (![DataStatus.Loaded, DataStatus.Loading].includes(this.$state.meta['entityTabs'])) {
          of(entityName).pipe(take(1)).subscribe(() => {
            const tabs = [
              {
                colName: 'colC',
                id: 't1',
                value: 't1',
                displayName: '遙信',
                selected: true
              },
              {
                colName: 'colC',
                id: 't2',
                value: 't2',
                displayName: '遥测',
                selected: false
              },
              {
                colName: 'colC',
                id: 't3',
                value: 't3',
                displayName: '遥脉',
                selected: false
              },
            ];
            this.$patch({
              entityTabs: tabs,
              meta: {
                entityTabs: DataStatus.Loaded
              }
            });
          });
        }
      },
      selectEntityTab(tabId: string) {
        this.entityTabs.forEach(tab => tab.selected = tab.id === tabId);
      }
    }
  });
  const _store = store();
  return _store;
}
