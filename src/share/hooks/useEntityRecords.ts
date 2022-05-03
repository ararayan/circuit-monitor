import { InfiniteScrollCustomEvent, useIonRouter } from '@ionic/vue';
import { Ref } from 'vue';
import { Entities, EntityRecord, getEntityStore } from "../entity";
import { storeToRefs } from 'pinia';

const useEntityRecords = (entityName: Entities, virtualScroller: Ref<any>) => {
  const router = useIonRouter();
  const entityStore = getEntityStore(entityName);
  const { records } = storeToRefs(entityStore);

  entityStore.getRecords(entityName, {init: true, nextPage: true });
 
  function loadData(evt: InfiniteScrollCustomEvent) {
    // load data 
    setTimeout(() => {
      entityStore.getRecords(entityName, { nextPage: true });
      console.log('Loaded data');
      if (virtualScroller.value) {
        virtualScroller.value?.['updateVisibleItems'](true);
      }
      evt.target.complete();
      // App logic to determine if all data is loaded
      // and disable the infinite scroll
    }, 1000);
  }
  function openRecord(item: EntityRecord) {
    entityStore.editViewEntityName;
    if (entityStore.editViewEntityName !== entityName) {
      const parentRecordId = item.id;
      const parentEntityName = entityName;
      router.push(`/entity/${parentEntityName}/${parentRecordId}/${entityStore.editViewEntityName}`);
    }else {
      const recordId = item.id;
      router.push(`/entity/${entityName}/${recordId}`);
    }
  }
  return { loadData, openRecord, records };
};


export { useEntityRecords };