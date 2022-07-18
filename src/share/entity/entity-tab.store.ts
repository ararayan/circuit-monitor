import { defineStore } from 'pinia';
import { of, take } from 'rxjs';
import { DataStatus } from '../data.meta';
import { Entities, EntityTabInfo } from './entity.types';
import { EntityStoreFeature, getEntityRecordStoreId } from "./entity-store-id";

const initialState = {
  entityName: '', 
  tabId: '',
  entityTabs: [] as EntityTabInfo[],
  meta: {
    entityTabs: DataStatus.Unloaded,
  }
};



export function useEntityTabStore(entityName: Entities) {
  const storeId = getEntityRecordStoreId(entityName, EntityStoreFeature.Tab);
  const store = defineStore(storeId, {
    state: () => {
      return {...initialState, entityName};
    },
    actions: {
      getTabs(entityName: Entities) {
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
      setTabSelected(tabId: string) {
        const tabs = this.entityTabs.map(tab => {
          tab.selected = tab.id === tabId;
          return {...tab};
        });
        this.$patch({
          entityTabs: tabs
        });
      },
      selectEntityTab(tabId: string) {
        this.tabId = tabId || '';
      }
    }
  });
  const _store = store();
  return _store;
}
