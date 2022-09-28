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
              <ion-menu-button :menu="menuId">
                <ion-icon :icon="searchCircleOutline"></ion-icon>
              </ion-menu-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content fullscreen :scroll-y="false">
          <ion-list :scroll-y="false" style="height: 100%">
            <RecycleScroller class="scroller ion-content-scroll-host" :items="records" :item-size="60" key-field="id"
              ref="virtualScroller">
              <template #default="{ item }">
                <ion-item>
                  <ion-label>
                    <span style="margin-left: 0.5em">pos: {{ item.pos }}</span>
                    <span style="margin-left: 0.5em">{{ ControlStatusTextMap[item.state as ControlStatusCode] }}</span>
                    <i style="color: var(--ion-color-medium); margin-left: 0.25em" v-if="!!item.msg">({{ item.msg }})</i>
                  </ion-label>
                </ion-item>
              </template>
            </RecycleScroller>
          </ion-list>
          <div class="empty-list" v-if="!records.length">
            <span v-if="!isInited">请使用搜索来获取事件列表。</span>
            <span v-if="isInited">当前日期时间范围内没有事件，请重新输入范围搜索。</span>
          </div>
        </ion-content>
      </div>
    </ion-split-pane>
  </ion-page>
</template>

<script lang="ts">
import SearchFormPanel from '@/components/search-form-panel.vue';
import { useEntityContext, useEntityDisplayName } from '@/share';
import { EventRecord, useEntityRecordsStore } from '@/share/entity';
import { ControlStatusCode, ControlStatusTextMap } from '@/share/entity/data/operations';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenuButton, IonPage, IonSplitPane, IonTitle, IonToolbar } from '@ionic/vue';
import { Ref, ref } from '@vue/reactivity';
import { arrowBackOutline, chevronForwardOutline, searchCircleOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { defineComponent, onUnmounted } from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';

/* 
  ion-content-scroll-host
  Ionic Framework requires that features such as collapsible large titles,
  ion-infinite-scroll, ion-refresher, and ion-reorder-group be used within an ion-content.
  To use these experiences with virtual scrolling, you must add the .ion-content-scroll-host class to the virtual scroll viewport.
*/

export default defineComponent({
  name: 'EventsView', 
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
    RecycleScroller, IonButtons, IonBackButton, IonSplitPane, IonMenuButton, IonIcon
  },
  setup() {
    const { entityName } = useEntityContext();
    const virtualScroller = ref(null) as Ref<any>;

    const menuId = ref(`${entityName}_menu`);
    const contentId = ref(`${entityName}_panel`);
    const { title } = useEntityDisplayName(entityName);

    const recordStore = useEntityRecordsStore<EventRecord>(entityName);
    const { records, isInited } = storeToRefs(recordStore);

    // function loadData (evt: InfiniteScrollCustomEvent) {
    //   // load data 
    //   setTimeout(() => {
    //     const subscription = recordStore.$subscribe((mutation) => {
    //       if (mutation.type === MutationType.patchObject) {
    //         if ([DataStatus.Loaded, DataStatus.Error].includes(mutation.payload.meta?.records as DataStatus)) {
    //           console.log('Loaded data');
    //           if (virtualScroller.value) {
    //             virtualScroller.value?.['updateVisibleItems'](true);
    //           }
    //           evt.target.complete();
    //           subscription();
    //         }
    //       }
    //     }, {detached: true});

    //     recordStore.getRecords(entityName, { criteria: {} });
    //   }, 500);
    // }

    
    
    // recordStore.getRecords(entityName, {isInit: true});
    onUnmounted(() => {
      recordStore.destroy();
    });
    return { ControlStatusTextMap,
      entityName, menuId, contentId, isInited,
      records, virtualScroller, title, searchCircleOutline, arrowBackOutline, chevronForwardOutline
    };
  },
});

</script>
<style>
.scroller {
  /* 100% => Rendered items limit reached, issue: https://github.com/Akryum/vue-virtual-scroller/issues/78; */
  height: 100%;
}
.empty-list{
  position: relative;
  z-index: 1;
  transform: translateY(-100%);
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.empty-list span {
  max-width: 80%;
  color: var(--ion-color-medium);
  margin-top: -4em;
}
</style>
