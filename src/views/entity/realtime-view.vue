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
    <ion-content :scroll-y="false">
      <entity-list :entity-name="entityName" :tab-id="tabId"></entity-list>
    </ion-content>
    <ion-footer>
      <entity-tab :tabList="entityTabs" @goto-tab="gotoTab($event)"></entity-tab>
    </ion-footer>

  </ion-page>
</template>

<script lang="ts">
import EntityList from '@/components/entity-list.vue';
import EntityTab from '@/components/entity-tab.vue';
import { destoryEntityStore, useEntityTabStore } from '@/share/entity';
import { useEntityContext, useEntityDisplayName } from '@/share/hooks';
import { IonBackButton, IonButtons, IonContent, IonFooter, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { storeToRefs } from 'pinia';
import { defineComponent, onUnmounted } from 'vue';


export default defineComponent({
  name: 'RealtimeView',
  components: {
    IonPage,  EntityTab, EntityList,
    IonFooter, IonContent, IonToolbar, IonTitle, IonButtons, IonHeader, IonBackButton
  },
  setup() {
    const { entityName } = useEntityContext();
    const entityTabStore = useEntityTabStore(entityName);
    const { entityTabs, tabId } = storeToRefs(entityTabStore);
    entityTabStore.getTabs(entityName);
    
    const { title } = useEntityDisplayName(entityName);

    function gotoTab(tabId: string) {
      const selectedTab = entityTabs.value.find(tab => tab.selected);
      if (selectedTab?.id !== tabId) {
        entityTabStore.setTabSelected(tabId);
      }else {
        entityTabStore.selectEntityTab(tabId);
      }
    }

    onUnmounted(() => {
      destoryEntityStore(entityName);
      entityTabStore.$dispose();
    });
    return { title, gotoTab, entityTabs, entityName, tabId };
  },
});
</script>

<style>
.entity-list-item {
  --border-color: var(--ion-color-light, #f2f2f2);
}
</style>
