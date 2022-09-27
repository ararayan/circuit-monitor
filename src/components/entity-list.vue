<template>
  <ion-list :scroll-y="false" style="height: 100%" :class="{ 'ion-hide': !!!records.length }">
    <RecycleScroller class="scroller ion-content-scroll-host" :items="records" :item-size="48" key-field="id"
      ref="virtualScroller">
      <template #default="{ item }">
        <ion-item @click="openRecord()" class="entity-list-item">
          <!-- <ion-icon :icon="documentTextOutline" slot="start" color="medium" size="large"></ion-icon> -->
          <ion-label>
            <i class="seq-number">{{ item.seq || '' }}</i>
            <span>{{ item.name }} <span style="margin-left: 1em">{{ item.desc }}</span></span>
          </ion-label>
        </ion-item>
      </template>
      <template #after>
        <ion-infinite-scroll @ionInfinite="loadData()" threshold="50px" id="infinite-scroll" ref="ionInfiniteScroll">
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
import { IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonSkeletonText, IonThumbnail } from '@ionic/vue';
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
    const { records } = storeToRefs(recordStore);
    const skeletonSize: string[] = Array.from({ length: 12 });
    const virtualScroller = ref(null) as Ref<any>;
    const ionInfiniteScroll = ref(null) as Ref<any>;
    let initTimeoutId = 0;

    watch(tabId, () => {
      if (tabId.value) {
        // clear prev pending timeout init process
        window.clearTimeout(initTimeoutId);

        // reset and scroll to top;
        recordStore.reset();
        virtualScroller.value?.scrollToPosition(0);

        // setTimeout to ensure reset and scroll to both process UI ready;
        initTimeoutId = setTimeout(() => {
          recordStore.setHasPagination(true);
          recordStore.setSyncFields(tabId.value === MixedModuleType.Yx ? ['status'] : ['value']);
          recordStore.getRecords(props.entityName, { criteria: { jgid: props.recordId, type: tabId.value }, isInit: true });
          const params = {
            jgid: props.recordId || -1,
            type: tabId.value
          };
          recordStore.startRecordsCheck(params);
          recordStore.subscribeRecordLoadResult({
            next: () => {
              if (recordStore.pagination.current > 1) {
                if (virtualScroller.value) {
                  virtualScroller.value?.updateVisibleItems(true);
                }
                ionInfiniteScroll?.value?.$el?.complete();
              }
            },
            error: () => {
              ionInfiniteScroll?.value?.$el?.complete();
            }
          });
        });
      }
    }, { immediate: true });



    function loadData() {
      // load data 
      recordStore.getRecords(props.entityName, { criteria: { jgid: props.recordId, type: tabId.value } });
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    function openRecord() { }
    onUnmounted(() => {
      window.clearTimeout(initTimeoutId);
      recordStore.destroy();
    });
    return { ionInfiniteScroll, records, scaleOutline, pulseOutline, radioOutline, loadData, skeletonSize, openRecord, virtualScroller };
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
.seq-number {
  margin-right: 1em;
  color: var(--ion-color-medium);
}
.seq-number:empty {
  margin-right: 0;
}
</style>
