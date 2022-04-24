<template>
  <ion-page>
    <ion-split-pane content-id="mainabc">
      <search-form :forms="searchForm" content-id="mainabc"></search-form>
      <div class="ion-page segments-view" id="mainabc">
        <ion-header translucent>
          <ion-toolbar mode="md" color="primary">
            <ion-buttons slot="start">
              <ion-back-button default-href="/home"></ion-back-button>
            </ion-buttons>
            <ion-title center>{{ title }}</ion-title>
            <ion-buttons slot="end">
              <ion-menu-button autoHide="false">
                <ion-icon :icon="searchCircleOutline"></ion-icon>
              </ion-menu-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content fullscreen :scroll-y="false">
          <ion-list :scroll-y="false" style="height: 100%">
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
      </div>
    </ion-split-pane>
  </ion-page>
</template>

<script lang="ts">
import { getEntityStore } from '@/share/entity';
import {
  IonPage, IonHeader, IonContent,
  IonButtons, IonBackButton, IonToolbar, IonTitle, IonIcon, 
  IonAvatar, IonLabel, IonItem, IonList, IonInfiniteScroll, IonSplitPane, IonMenuButton,
  IonInfiniteScrollContent, InfiniteScrollCustomEvent
} from '@ionic/vue';
import { storeToRefs } from 'pinia';
import { defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import { RecycleScroller } from 'vue-virtual-scroller';
import { computed, Ref, ref } from '@vue/reactivity';
import { searchCircleOutline, arrowBackOutline } from 'ionicons/icons';
import  SearchForm  from '@/components/SearchForm.vue';
import { useUserStore } from '@/share/user';
import { DataStatus } from '@/share';
/* 
  ion-content-scroll-host
  Ionic Framework requires that features such as collapsible large titles,
  ion-infinite-scroll, ion-refresher, and ion-reorder-group be used within an ion-content.
  To use these experiences with virtual scrolling, you must add the .ion-content-scroll-host class to the virtual scroll viewport.
*/

export default defineComponent({
  name: 'SegmentsView', // 分隔图tab
  components: {
    SearchForm,
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
    IonInfiniteScrollContent, IonButtons, IonBackButton, IonSplitPane, IonMenuButton, IonIcon
  },
  setup() {
    const route = useRoute();
    const entityName = route.params.entityName as string;
    const entityStore = getEntityStore(entityName);
    const virtualScroller = ref(null) as Ref<any>;
    const { records, searchForm } = storeToRefs(entityStore);

    const userStore = useUserStore();
    const { menus }  = storeToRefs(userStore);
    const title = computed(() => {
      return menus.value.find(item => item.id === entityName)?.name || '';
    });
    let page = 1;
    entityStore.getRecords(entityName, { page });
    page++;
    function loadData(evt: InfiniteScrollCustomEvent) {
      // load data 
      setTimeout(() => {
        entityStore.getRecords(entityName, { page });
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
      records, loadData, virtualScroller, title, searchCircleOutline, arrowBackOutline, searchForm
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
