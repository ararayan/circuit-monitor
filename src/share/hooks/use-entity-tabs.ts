import { Entities, getEntityStore } from "@/share";
import { storeToRefs } from 'pinia';
import { computed, watch } from "vue";

const useEntityTab = (entityName: Entities) => {
  const entityStore = getEntityStore(entityName);
  entityStore.getEntityTabs(entityName);
  const { entityTabs } = storeToRefs(entityStore);
  const selectTabId =  computed(() => {
    return entityTabs.value.find(tab => tab.selected)?.id || '';
  });
  watch(selectTabId, (next) => {
    entityStore.clearRecords();
    entityStore.getRecords(entityName, { tabId: next });
  }, {immediate: true});

  function gotoTab(tab: any) {
    entityStore.selectEntityTab(tab.id);
  }
  return {
    entityTabs,
    gotoTab,
  };
};


export { useEntityTab };