<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar mode="md" color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title center>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen :scroll-y="false">
      <ion-list :scroll-y="false" style="height: 100%">
        <RecycleScroller class="scroller ion-content-scroll-host" :items="records" :item-size="88" key-field="id"
          ref="virtualScroller">
          <template #before>
            <ion-infinite-scroll @ionInfinite="loadData($event, 'top')" threshold="10%" id="infinite-scroll"
              position="top" :disabled="pagination.current < 3">
              <ion-infinite-scroll-content loading-spinner="bubbles" loading-text="Loading previous data...">
              </ion-infinite-scroll-content>
            </ion-infinite-scroll>
          </template>
          <template #default="{ item }">
            <ion-item @click="openRecord(item)">
              <ion-label>
                <h2>{{ item.name }}</h2>
                <h3>{{ item.note }}</h3>
              </ion-label>
              <ion-icon :icon="chevronForwardOutline" slot="end" color="medium"></ion-icon>
            </ion-item>
          </template>
          <template #after>
            <ion-infinite-scroll @ionInfinite="loadData($event, 'bottom')" threshold="10%" id="infinite-scroll">
              <ion-infinite-scroll-content loading-spinner="bubbles" loading-text="Loading more data...">
              </ion-infinite-scroll-content>
            </ion-infinite-scroll>
          </template>
        </RecycleScroller>
      </ion-list>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">

import { DataStatus, EntityRecord, useEntityContext, useEntityDisplayName, useEntityRecordsStore } from '@/share';
import { InfiniteScrollCustomEvent, IonAvatar, IonBackButton, IonButtons,
  IonContent, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem,
  IonLabel, IonList, IonPage, IonTitle, IonToolbar, useIonRouter
} from '@ionic/vue';
import { Ref, ref } from '@vue/reactivity';
import { arrowBackOutline, chevronForwardOutline, searchCircleOutline } from 'ionicons/icons';
import { MutationType, storeToRefs } from 'pinia';
import { defineComponent, onUnmounted } from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';

/* 
  ion-content-scroll-host
  Ionic Framework requires that features such as collapsible large titles,
  ion-infinite-scroll, ion-refresher, and ion-reorder-group be used within an ion-content.
  To use these experiences with virtual scrolling, you must add the .ion-content-scroll-host class to the virtual scroll viewport.
*/

export default defineComponent({
  name: 'WiringsView', // 分隔图tab
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonContent,
    IonLabel,
    RecycleScroller,
    IonInfiniteScroll,
    IonInfiniteScrollContent, IonButtons, IonBackButton, IonIcon
  },
  setup() {
    const router = useIonRouter();
    const { entityName } = useEntityContext();
    const virtualScroller = ref(null) as Ref<any>;



    const { title } = useEntityDisplayName(entityName);


    const recordStore = useEntityRecordsStore(entityName);

    const { records, pagination } = storeToRefs(recordStore);

    function loadData(evt: InfiniteScrollCustomEvent, diretctoin: 'top' | 'bottom') {
      // load data 
      setTimeout(() => {
        const subscription = recordStore.$subscribe((mutation, state) => {
          if (mutation.type === MutationType.patchObject) {
            if ([DataStatus.Loaded, DataStatus.Error].includes(mutation.payload.meta?.records as DataStatus)) {
              console.log('Loaded data');

              if (virtualScroller.value) {
                (window as any).tt = virtualScroller.value;
                virtualScroller.value?.['updateVisibleItems'](true);
              }
              evt.target.complete();
              subscription();
            }
          }
        }, { detached: true });

        recordStore.getRecords(entityName, { criteria: {} });
      }, 500);
    }

    function openRecord(item: EntityRecord) {
      const recordId = item.id;
      recordStore.setOpenRecord(recordId);
      router.push(`/entity/${entityName}/${recordId}`);
    }

    recordStore.getRecords(entityName, { isInit: true });

    onUnmounted(() => {
      recordStore.$dispose();
    });
    return {
      openRecord, entityName, pagination,
      records, loadData, virtualScroller, title, searchCircleOutline, arrowBackOutline, chevronForwardOutline
    };
  },
});
</script>
<style>
.scroller {
  /* 100% => Rendered items limit reached, issue: https://github.com/Akryum/vue-virtual-scroller/issues/78; */
  height: 100%;
}
</style>
