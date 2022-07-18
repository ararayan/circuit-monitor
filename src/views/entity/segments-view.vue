<template>
  <ion-page mode="md">
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

        </ion-content>
      </div>
    </ion-split-pane>
  </ion-page>
</template>

<script lang="ts">
import SearchFormPanel from '@/components/search-form-panel.vue';
import { Entities, useEntityContext, useEntityDisplayName } from '@/share';
import { EntityRecord, useEntityRecordsStore, useEntityRelationStore, useEntitySearchFormStore } from '@/share/entity';
import { useIonRouter, IonAvatar, IonBackButton, IonButtons, IonContent,
  IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, InfiniteScrollCustomEvent,
  IonLabel, IonList, IonMenuButton, IonPage, IonSplitPane, IonTitle, IonToolbar, useBackButton } from '@ionic/vue';
import { Ref, ref } from '@vue/reactivity';
import { arrowBackOutline, chevronForwardOutline, searchCircleOutline } from 'ionicons/icons';
import { defineComponent, onUnmounted } from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';
import { storeToRefs } from 'pinia';
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
    SearchFormPanel,
    RecycleScroller,
    IonInfiniteScroll, 
    IonInfiniteScrollContent, IonButtons, IonBackButton, IonSplitPane, IonMenuButton, IonIcon
  },
  setup() {
    const router = useIonRouter();
    const { entityName } = useEntityContext();
    const virtualScroller = ref(null) as Ref<any>;

    const { title } = useEntityDisplayName(entityName);
    const menuId = ref(`${entityName}_menu`);
    const contentId = ref(`${entityName}_panel`);

    const recordStore = useEntityRecordsStore(entityName);
    const { records } = storeToRefs(recordStore);
    
    const searchFormStore = useEntitySearchFormStore(entityName);
    const { searchForm } = storeToRefs(searchFormStore);

    const relationEntity = useEntityRelationStore(entityName);
    const { editViewEntityName } = storeToRefs(relationEntity);
    relationEntity.setEditViewRelateEntity(Entities.SegmentsChild);

    function loadData (evt: InfiniteScrollCustomEvent) {
      // load data 
      setTimeout(() => {
        recordStore.getRecords(entityName, { criteria: searchForm, });
        console.log('Loaded data');
        if (virtualScroller.value) {
          virtualScroller.value?.['updateVisibleItems'](true);
        }
        evt.target.complete();
        // App logic to determine if all data is loaded
        // and disable the infinite scroll
      }, 1000);
    }

    function openRecord (item: EntityRecord) {
      if (editViewEntityName.value !== entityName) {
        const parentRecordId = item.id;
        const parentEntityName = entityName;
        router.push(`/entity/${parentEntityName}/${parentRecordId}/${editViewEntityName.value}`);
      }else {
        const recordId = item.id;
        router.push(`/entity/${entityName}/${recordId}`);
      }
    }

    const result = useBackButton(11, (next) => {
      next();
    });

    // init 
    recordStore.getRecords(entityName, {});
    // onMounted(() => {
      
    // });
    onUnmounted(() => {
      result.unregister();
      recordStore.$dispose();
    });
  
    return {
      openRecord, entityName, menuId, contentId,
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
.entity-list-item {
  --border-color: var(--ion-color-light, #f2f2f2);
}
</style>
