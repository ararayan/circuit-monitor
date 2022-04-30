<template>
  <ion-page mode="md">
    <ion-split-pane content-id="mainabc">
      <search-form-panel :entityName="entityName" content-id="mainabc"></search-form-panel>
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
import SearchFormPanel from '@/components/SearchFormPanel.vue';
import { EntityRecord, getEntityStore } from '@/share/entity';
import { useUserStore } from '@/share/user';
import { InfiniteScrollCustomEvent, IonAvatar, IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonMenuButton, IonPage, IonSplitPane, IonTitle, IonToolbar } from '@ionic/vue';
import { computed, Ref, ref } from '@vue/reactivity';
import { arrowBackOutline, chevronForwardOutline, searchCircleOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { defineComponent, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { RecycleScroller } from 'vue-virtual-scroller';
import { useBackButton } from '@ionic/vue';
import { useEntityContext } from '@/share';

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
    const router = useRouter();
    const { entityName } = useEntityContext();
    const entityStore = getEntityStore(entityName);
    const virtualScroller = ref(null) as Ref<any>;
    const { records, editViewEntityName, pagination } = storeToRefs(entityStore);
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
      const current = pagination.value.current;
      const dispose = watch(pagination, (change) => {
        if (change.current >= current + 1 || change.current === change.total) {
          if (virtualScroller.value) {
            virtualScroller.value?.['updateVisibleItems'](true);
          }
          evt.target.complete();
          dispose();
        }
      }, {deep: true});
      entityStore.getRecords(entityName, { nextPage: true });
    }
    function openRecord(item: EntityRecord) {
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
    onUnmounted(() => {
      result.unregister();
    });
  
    return {
      openRecord, entityName,
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
