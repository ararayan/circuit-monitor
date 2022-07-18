<template>
  <ion-list :scroll-y="false" style="height: 100%" :class="{ 'ion-hide': !!!records.length }">
    <RecycleScroller class="scroller ion-content-scroll-host" :items="records" :item-size="88" key-field="id"
      ref="virtualScroller">
      <template #default="{ item }">
        <ion-item @click="openRecord(item)" class="entity-list-item">
          <ion-avatar slot="start">
            <img :src="item.avatar" />
          </ion-avatar>
          <ion-label siz>
            <h2>{{ item.displayName }}</h2>
            <i>{{ item.colA }}</i>
            <p>{{ item.colB }}</p>
          </ion-label>
          <ion-icon :icon="chevronForwardOutline" slot="end" color="medium"></ion-icon>
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
import { DataStatus, Entities } from '@/share';
import { EntityRecord, useEntityRecordsStore } from '@/share/entity';
import { InfiniteScrollCustomEvent, IonIcon, IonItem, IonLabel, IonList, 
  IonInfiniteScroll, IonInfiniteScrollContent, IonAvatar,
  IonSkeletonText, IonThumbnail } from '@ionic/vue';
import { toRefs } from '@vue/reactivity';
import { pulseOutline, radioOutline, scaleOutline, chevronForwardOutline } from 'ionicons/icons';
import { storeToRefs, MutationType } from 'pinia';
import { defineComponent, onUnmounted, PropType, Ref, ref, watch } from 'vue';

import { RecycleScroller } from 'vue-virtual-scroller';

export default defineComponent({
  name: 'EntityList',
  components: {
    IonLabel, IonIcon, IonThumbnail, IonSkeletonText, IonList, IonItem, RecycleScroller,
    IonInfiniteScroll, IonAvatar,
    IonInfiniteScrollContent
  },
  props: {
    entityName: { type: String as PropType<Entities>, required: true },
    tabId: {type: String, required: true },
  },
  setup(props) {
    const { entityName, tabId } = toRefs(props);
    const recordStore = useEntityRecordsStore(entityName.value);
    const { records }  = storeToRefs(recordStore);
    const skeletonSize: string[] = Array.from({ length: 12 });
    const virtualScroller = ref(null) as Ref<any>;

    watch(tabId, () => {
      if (tabId.value) {
        recordStore.getRecords(props.entityName, {criteria: {tabId: tabId.value}, isInit: true });
      }
    }, {immediate: true});

   

    function loadData (evt: InfiniteScrollCustomEvent) {
      // load data 
      setTimeout(() => {
        const subscription = recordStore.$subscribe((mutation, state) => {
          if (mutation.type === MutationType.patchObject) {
            if ([DataStatus.Loaded, DataStatus.Error].includes(mutation.payload.meta?.records as DataStatus)) {
              console.log('Loaded data');
              if (virtualScroller.value) {
                virtualScroller.value?.['updateVisibleItems'](true);
              }
              evt.target.complete();
              subscription();
            }
          }
        }, {detached: true});

        recordStore.getRecords(props.entityName, { criteria: {tabId: tabId.value} });
        // App logic to determine if all data is loaded
        // and disable the infinite scroll
      }, 500);
    }

    function openRecord (item: EntityRecord) {
      // debugger;
    }
    onUnmounted(() => {
      recordStore.$dispose();
    });
    return { records, scaleOutline, pulseOutline, radioOutline, chevronForwardOutline, loadData, skeletonSize, openRecord };
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
