<template>
  <ion-list :scroll-y="false" style="height: 100%" :class="{ 'ion-hide': !!!records.length }">
    <RecycleScroller class="scroller ion-content-scroll-host" :items="records" :item-size="66" key-field="id"
      ref="virtualScroller">
      <template #default="{ item }">
        <ion-item @click="openRecord()" class="entity-list-item">
          <!-- <ion-icon :icon="documentTextOutline" slot="start" color="medium" size="large"></ion-icon> -->
          <ion-label>
            <h2>{{ item.name }}</h2>
            <i style="color: var(--ion-color-medium)">{{ item.desc }}</i>
          </ion-label>
        </ion-item>
      </template>
      <template #after>
        <ion-infinite-scroll @ionInfinite="loadData($event)" threshold="50px" id="infinite-scroll">
          <ion-infinite-scroll-content loading-spinner="bubbles" loading-text="Loading more data...">
          </ion-infinite-scroll-content>
        </ion-infinite-scroll>
      </template>
    </RecycleScroller>
  </ion-list>
  <ion-list :class="{ 'ion-hide': !!records.length }">
    <ion-item v-for="(item, index) in skeletonSize" :key="index">
      <ion-thumbnail slot="start">
        <ion-skeleton-text></ion-skeleton-text>
      </ion-thumbnail>
      <ion-label>
        <h3>
          <ion-skeleton-text animated style="width: 80%"></ion-skeleton-text>
        </h3>
        <p>
          <ion-skeleton-text animated style="width: 60%"></ion-skeleton-text>
        </p>
        <p>
          <ion-skeleton-text animated style="width: 30%"></ion-skeleton-text>
        </p>
      </ion-label>
    </ion-item>
  </ion-list>
</template>

<script lang="ts">
import { Entities, MixedModuleType } from '@/share';
import { useEntityRecordsStore } from '@/share/entity';
import { InfiniteScrollCustomEvent, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonSkeletonText, IonThumbnail } from '@ionic/vue';
import { toRefs } from '@vue/reactivity';
import { pulseOutline, radioOutline, scaleOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { defineComponent, onUnmounted, PropType, Ref, ref, watch } from 'vue';

import { RecycleScroller } from 'vue-virtual-scroller';

export default defineComponent({
  name: 'EntityList',
  components: {
    IonLabel, IonThumbnail, IonSkeletonText, IonList, IonItem, RecycleScroller,
    IonInfiniteScroll,
    IonInfiniteScrollContent
  },
  props: {
    entityName: { type: String as PropType<Entities>, required: true },
    recordId: { type: String, required: true },
    tabId: { type: String, required: true },
  },
  setup(props) {
    const { tabId } = toRefs(props);
    const recordStore = useEntityRecordsStore(props.entityName);
    const { records, isInited } = storeToRefs(recordStore);
    const skeletonSize: string[] = Array.from({ length: 12 });
    const virtualScroller = ref(null) as Ref<any>;

    watch(tabId, () => {
      if (tabId.value) {
        recordStore.reset();
        recordStore.setHasPagination(true);
        recordStore.setSyncFields(tabId.value === MixedModuleType.Yx ? ['status'] : ['value']);
        recordStore.getRecords(props.entityName, { criteria: { jgid: props.recordId, type: tabId.value }, isInit: true });
        const params = {
          jgid: props.recordId || -1,
          type: tabId.value
        };
        recordStore.startRecordsCheck(params);
      }
    }, { immediate: true });

    const isInitedSubscription = watch(isInited, (prev, curr) => {
      if (!prev && curr) {
        if (virtualScroller.value) {
          virtualScroller.value?.scrollToPosition(0);
          virtualScroller.value?.updateVisibleItems(true);
        }
      }
    });


    function loadData(evt: InfiniteScrollCustomEvent) {
      // load data 
      recordStore.subscribeRecordLoadResult(() => {
        if (virtualScroller.value) {
          virtualScroller.value?.updateVisibleItems(true);
        }
        evt.target.complete();
      });
      recordStore.getRecords(props.entityName, { criteria: { jgid: props.recordId, type: tabId.value } });
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    function openRecord() { }
    onUnmounted(() => {
      isInitedSubscription();
      recordStore.destroy();
    });
    return { records, scaleOutline, pulseOutline, radioOutline, loadData, skeletonSize, openRecord, virtualScroller };
  },
});
</script>

<style>
.scroller {
  /* 100% => Rendered items limit reached, issue: https://github.com/Akryum/vue-virtual-scroller/issues/78; */
  height: 100%;
}

.entity-list-item {
  --border-color: var(--ion-color-light, #f2f2f2);
}
</style>
