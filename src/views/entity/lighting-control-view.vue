<template>
  <ion-page>
    <ion-split-pane :contentId="contentId">
      <search-form-panel :entityName="entityName" :contentId="contentId" :menuId="menuId"></search-form-panel>
      <div class="ion-page segments-view" :id="contentId">
        <ion-header translucent>
          <ion-toolbar mode="md" color="primary">
            <ion-buttons slot="start">
              <ion-back-button default-href="/home"></ion-back-button>
            </ion-buttons>
            <ion-title center>{{ title }}</ion-title>
            <ion-buttons slot="end">
              <ion-menu-button autoHide="false" :menu="menuId">
                <ion-icon :icon="searchCircleOutline"></ion-icon>
              </ion-menu-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content fullscreen :scroll-y="false">
          <ion-list :scroll-y="false" style="height: 100%">
            <RecycleScroller class="scroller ion-content-scroll-host" :items="records" :item-size="88" key-field="id"
              ref="virtualScroller">
              <template #default="{ item }">
                <ion-item>
                  <ion-label>
                    <h2>{{ item.displayName }}</h2>
                    <h3>{{ item.colA }}</h3>
                    <p>{{ item.colB }}</p>
                  </ion-label>
                   <ion-toggle slot="end" name="grape" color="warning" :checked="item.controlCol"></ion-toggle>
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
import SearchFormPanel from '@/components/search-form-panel.vue';
import { useEntityContext, useEntityDisplayName, useEntityRecords } from '@/share';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonMenuButton, IonPage, IonSplitPane, IonTitle, IonToggle, IonToolbar } from '@ionic/vue';
import { Ref, ref } from '@vue/reactivity';
import { arrowBackOutline, chevronForwardOutline, searchCircleOutline } from 'ionicons/icons';
import { defineComponent } from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';


export default defineComponent({
  name: 'LightingControlView', // 分隔图tab
  components: { IonToggle,
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
    const { entityName } = useEntityContext();
    const virtualScroller = ref(null) as Ref<any>;

    const menuId = ref(`${entityName}_menu`);
    const contentId = ref(`${entityName}_panel`);

    const { title } = useEntityDisplayName(entityName);

    const { loadData, records } = useEntityRecords(entityName, virtualScroller);
    return {
      entityName, menuId, contentId,
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
