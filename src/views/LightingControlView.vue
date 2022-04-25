<template>
  <ion-page>
    <ion-split-pane content-id="mainabc">
      <search-form-panel :entityName="entityName" content-id="mainabc"></search-form-panel>
      <div class="ion-page segments-view" id="mainabc">
        <ion-header translucent>
          <ion-toolbar mode="md" color="primary">
            <ion-buttons slot="start">
              <ion-back-button default-href="/home" @click="gotoHome()"></ion-back-button>
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
                  <ion-label>
                    <h2>{{ item.displayName }}</h2>
                    <h3>{{ item.colA }}</h3>
                    <p>{{ item.colB }}</p>
                  </ion-label>
                   <ion-toggle slot="end" name="grape" color="tertiary" :checked="item.controlCol"></ion-toggle>
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
import { Entities, getEntityStore } from '@/share/entity';
import {
  IonPage, IonHeader, IonContent,
  IonButtons, IonBackButton, IonToolbar, IonTitle, IonIcon, 
  IonLabel, IonItem, IonList, IonInfiniteScroll, IonSplitPane, IonMenuButton,
  IonInfiniteScrollContent, InfiniteScrollCustomEvent
} from '@ionic/vue';
import { storeToRefs } from 'pinia';
import { defineComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { RecycleScroller } from 'vue-virtual-scroller';
import { computed, Ref, ref } from '@vue/reactivity';
import { searchCircleOutline, arrowBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { useUserStore } from '@/share/user';
import SearchFormPanel from '@/components/SearchFormPanel.vue';
import { getMatchedEntityInfoByRoute } from '@/share';


export default defineComponent({
  name: 'LightingControlView', // 分隔图tab
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonContent,
    IonLabel,
    SearchFormPanel,
    RecycleScroller,
    IonInfiniteScroll, 
    IonInfiniteScrollContent, IonButtons, IonBackButton, IonSplitPane, IonMenuButton, IonIcon
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { entityName } = getMatchedEntityInfoByRoute(route);
    const entityStore = getEntityStore(entityName);
    const virtualScroller = ref(null) as Ref<any>;
    const { records } = storeToRefs(entityStore);
    entityStore.initEditViewEntity(entityName);
    entityStore.getSearchForm(entityName);
    const userStore = useUserStore();
    const { menus }  = storeToRefs(userStore);
    const title = computed(() => {
      return menus.value.find(item => item.id === entityName)?.name || '';
    });

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
    function gotoHome() {
      router.push('/home');
    }
    return {
      gotoHome, entityName,
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
