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
            <DynamicScroller class="scroller ion-content-scroll-host" :items="records"  :min-item-size="60" key-field="id" >
              <template v-slot="{ item, index, active }">
                <DynamicScrollerItem :item="item" :active="active"  :data-index="index">
                <div class="event-list-item ion-padding-top ion-padding-bottom ion-margin-start ion-margin-end">
                      <div style="color: var(--ion-color-medium); font-style: italic;">{{item.date}}</div>
                      <div class="event-list-item-main">
                        <ion-label>{{ item.pos }}</ion-label>
                        <ion-label>{{ ControlStatusCodeTexts[item.state as ControlStatusCode] }}</ion-label>
                      </div>
                      <i style="color: var(--ion-color-medium);" v-if="!!item.msg">({{ item.msg }})</i>
                    </div>
                </DynamicScrollerItem>
              </template>
            </DynamicScroller>
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
import { ControlStatusCode, ControlStatusCodeTexts } from '@/share/entity/data/operations';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonLabel, IonList, IonMenuButton, IonPage, IonSplitPane, IonTitle, IonToolbar } from '@ionic/vue';
import { ref } from '@vue/reactivity';
import { arrowBackOutline, chevronForwardOutline, searchCircleOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { defineComponent, onUnmounted } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';

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
    IonContent,
    IonLabel,
    SearchFormPanel,
    DynamicScroller, IonButtons, IonBackButton, IonSplitPane, IonMenuButton, IonIcon, DynamicScrollerItem
  },
  setup() {
    const { entityName } = useEntityContext();

    const menuId = ref(`${entityName}_menu`);
    const contentId = ref(`${entityName}_panel`);
    const { title } = useEntityDisplayName(entityName);

    const recordStore = useEntityRecordsStore<EventRecord>(entityName);
    const { records, isInited } = storeToRefs(recordStore);

    onUnmounted(() => {
      recordStore.destroy();
    });
    return { ControlStatusCodeTexts, ControlStatusCode,
      entityName, menuId, contentId, isInited,
      records, title, searchCircleOutline, arrowBackOutline, chevronForwardOutline
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

.event-list-item {
  padding-left: 0.5em;
  padding-right: 0.5em;
  padding-bottom: 0.5em;
  border-bottom: 1px solid #e0e0e0;
}

.event-list-item-main {
  display: flex;
  justify-content: space-between;

}
</style>
