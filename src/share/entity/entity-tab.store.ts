import { defineStore } from 'pinia';
import { of, take } from 'rxjs';
import { DataStatus } from '../data.meta';
import { Entities } from './entity.types';
import { EntityStoreFeature, getEntityRecordStoreId } from "./entity-store-id";



//Programmable logic controller (PLC), DCS & PAC: mixed module (遥测AI/遥调AO/遥信DI/遥控DO) - system integrated circuits and reference designs
export enum MixedModuleType {
  Yx = 'yx',
  Yc = 'yc',
  Ym = 'ym'
}

export interface EntityTabInfo {
  colName: string;
  id: MixedModuleType;
  value: string;
  displayName: string;
  selected: boolean;
}

export function useEntityTabStore(entityName: Entities) {
  const storeId = getEntityRecordStoreId(entityName, EntityStoreFeature.Tab);
  const store = defineStore(storeId, {
    state: () => {
      const initialState = {
        entityName: '', 
        tabId: '',
        entityTabs: [] as EntityTabInfo[],
        meta: {
          entityTabs: DataStatus.Unloaded,
        }
      };
      
      return {...initialState, entityName};
    },
    actions: {
      getTabs(entityName: Entities) {
        if (![DataStatus.Loaded, DataStatus.Loading].includes(this.$state.meta['entityTabs'])) {
          of(entityName).pipe(take(1)).subscribe(() => {
            const tabs = [
              {
                colName: MixedModuleType.Yx,
                id: MixedModuleType.Yx,
                value: MixedModuleType.Yx,
                displayName: '遙信',
                selected: true
              },
              {
                colName: MixedModuleType.Yc,
                id: MixedModuleType.Yc,
                value: MixedModuleType.Yc,
                displayName: '遥测',
                selected: false
              },
              {
                colName: MixedModuleType.Ym,
                id: MixedModuleType.Ym,
                value: MixedModuleType.Ym,
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
      setTabSelected(tabId: MixedModuleType) {
        const tabs = this.entityTabs.map(tab => {
          tab.selected = tab.id === tabId;
          return {...tab};
        });
        this.$patch({
          entityTabs: tabs
        });
      },
      selectEntityTab(tabId: MixedModuleType) {
        this.tabId = tabId || '';
      },
      destroy() {
        this.$dispose();
        this.$reset();
      }
    }
  });
  const _store = store();
  return _store;
}
