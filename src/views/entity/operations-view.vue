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
                <ion-item @click="editRecord(item)">
                  <ion-avatar slot="start">
                    <img :src="item.avatar" />
                  </ion-avatar>
                  <ion-label>
                    <h2>{{ item.displayName }}</h2>
                    <h3>{{ item.colA }}</h3>
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
    
  <ensure-password-modal :is-open="isOpenEnsurePwModal" @update:password="submitPassword($event)" @update:close="modalClose()"></ensure-password-modal>
  </ion-page>
</template>

<script lang="ts">
import EnsurePasswordModal from '@/components/ensure-password-modal.vue';
import SearchFormPanel from '@/components/search-form-panel.vue';
import { DataStatus, EntityRecord, FormField, useEntityContext, useEntityDisplayName, useEntityRecordsStore } from '@/share';
import { useEnsurePassword } from '@/share/hooks/use-ensure-password';
import { InfiniteScrollCustomEvent, IonAvatar, IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonMenuButton, IonPage, IonSplitPane, IonTitle, IonToolbar, useIonRouter } from '@ionic/vue';
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
  name: 'OperationsView',
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
    IonInfiniteScroll, EnsurePasswordModal,
    IonInfiniteScrollContent, IonButtons, IonBackButton, IonSplitPane, IonMenuButton, IonIcon
  },
  setup() {
    debugger;
    const router = useIonRouter();
    const { entityName } = useEntityContext();
    const virtualScroller = ref(null) as Ref<any>;
    const menuId = ref(`${entityName}_menu`);
    const contentId = ref(`${entityName}_panel`);
    const { title } = useEntityDisplayName(entityName);
    const isOpenEnsurePwModal = ref(false);

    const recordStore = useEntityRecordsStore(entityName);
    const { records } = storeToRefs(recordStore);


    function openRecord (item: EntityRecord) {
      const recordId = item.id;
      router.push(`/entity/${entityName}/${recordId}`);
    }

    const { setPendingOpenRecord, openRecordByCheckPassword } = useEnsurePassword(openRecord);
    
    const editRecord = (item: EntityRecord) => {
      isOpenEnsurePwModal.value = true;
      setPendingOpenRecord(item);
    };
    function submitPassword(password: FormField) {
      openRecordByCheckPassword(password.value as string);
      isOpenEnsurePwModal.value = false;
    }

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

        recordStore.getRecords(entityName, { criteria: {} });
      }, 500);
    }
    // const openModal = async function() {
    //   const modal = await modalController
    //     .create({
    //       id: 'pw_modal_1',
    //       cssClass: 'auto-height',
    //       backdropDismiss: true,
    //       swipeToClose: true,
    //       component: EnsurePasswordModal,
    //       componentProps: {
    //         modalId: 'pw_modal_1'
    //       },
    //     }) as Components.IonModal;
    //   await modal.present();
    //   modal.canDismiss = () => {
    //     return Promise.resolve(false);
    //   };
    //   debugger;
    //   const abc =  await modal.onDidDismiss<string>();
    //   debugger;
    //   return abc;
    // };
    function modalClose() {
      debugger;
      isOpenEnsurePwModal.value = false;
    }
    // init 
    recordStore.getRecords(entityName, {isInit: true});
    
    onUnmounted(() => {
      recordStore.$dispose();
    });
    return {
      openRecord, entityName, menuId, contentId, editRecord, isOpenEnsurePwModal, submitPassword, modalClose,
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

ion-modal.auto-height {
    --height: auto;
}
ion-modal.auto-height .ion-page {
    position: relative;
    display: block;
    contain: content;
}
ion-modal.auto-height .ion-page .inner-content {
    max-height: 80vh;
    overflow: auto;
}

</style>
