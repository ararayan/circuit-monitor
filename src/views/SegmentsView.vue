<template>
  <ion-page class="segments-view">
    <test-watch :items="records" ref="testWatch"></test-watch>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>List</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen :scroll-y="false">
      <ion-list :scroll-y="false">
        <RecycleScroller class="scroller ion-content-scroll-host" :items="records" :item-size="84" key-field="id"
          ref="virtualScroller">
          <template #default="{ item }">
            <ion-item>
              <ion-avatar slot="start">
                <img :src="item.avatar" />
              </ion-avatar>
              <ion-label>
                <h2>{{ item.displayName }}</h2>
                <h3>{{ item.colA }}</h3>
                <p>{{ item.colB }}</p>
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

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { createEntityStore } from '@/share/entity';
import { IonPage, IonHeader, IonContent, IonToolbar, IonTitle, IonAvatar, IonLabel, IonItem, IonList, IonInfiniteScroll, IonInfiniteScrollContent, InfiniteScrollCustomEvent } from '@ionic/vue';
import { storeToRefs } from 'pinia';
import { defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import { RecycleScroller } from 'vue-virtual-scroller';
import { Ref, ref } from '@vue/reactivity';

/* 
  ion-content-scroll-host
  Ionic Framework requires that features such as collapsible large titles,
  ion-infinite-scroll, ion-refresher, and ion-reorder-group be used within an ion-content.
  To use these experiences with virtual scrolling, you must add the .ion-content-scroll-host class to the virtual scroll viewport.
*/

export default defineComponent({
  name: 'SegmentsView', // 分隔图tab
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonContent,
    IonAvatar,
    IonLabel,
    RecycleScroller,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
  },
  setup() {
    const store = createEntityStore('segments');
    const route = useRoute();
    const entityName = route.params.entityName as string;
    const virtualScroller = ref(null) as Ref<any>;
    const { records } = storeToRefs(store);
    debugger;
    let page = 1;
    store.getRecords(entityName, { page });
    page++;
    function loadData(evt: InfiniteScrollCustomEvent) {
      // load data 
      setTimeout(() => {
        store.getRecords(entityName, { page });
        console.log('Loaded data');
        if (virtualScroller.value) {
          virtualScroller.value?.['updateVisibleItems'](true);
        }
        evt.target.complete();
        page++;
        // App logic to determine if all data is loaded
        // and disable the infinite scroll
      }, 1000);
    }
    return {
      records, loadData, virtualScroller
    };
  },
});
</script>
<style>
.scroller {
  /* 100% => Rendered items limit reached, issue: https://github.com/Akryum/vue-virtual-scroller/issues/78; */
  height: 80vh;
}
</style>
