/* eslint-disable vue/no-unused-components */
<template>
    <ion-page mode="md">
         <ion-header translucent>
          <ion-toolbar color="primary">
            <ion-buttons slot="start" >
                <ion-back-button :default-href="defaultHref"></ion-back-button>
            </ion-buttons>
            <ion-title center>{{ title + '列表子项' }}</ion-title>
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
import { useEntityTabStore } from '@/share/entity';
import { useEntityContext, useEntityDisplayName } from '@/share/hooks';
import { IonBackButton, IonButtons, IonContent, IonFooter, IonHeader, IonPage, IonTitle, IonToolbar, useBackButton } from '@ionic/vue';
import { storeToRefs } from 'pinia';
import { defineComponent, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'SegmentsChildView',
  components: { IonPage, IonFooter, EntityTab, EntityList,
    IonContent, IonToolbar, IonTitle, IonButtons, IonHeader,IonBackButton },
  setup() {
    const router = useRouter();
    const { entityName, parentEntityName } = useEntityContext();
    const entityTabStore = useEntityTabStore(entityName);
    const { entityTabs, tabId } = storeToRefs(entityTabStore);
    entityTabStore.getTabs(entityName);

    const { title } = useEntityDisplayName(entityName);
 
    const defaultHref =  parentEntityName ? `/entity/${parentEntityName}` : '/home';

    const result = useBackButton(10, () => {
      router.back();
    });

    function gotoTab(tabId: string) {
      const selectedTab = entityTabs.value.find(tab => tab.selected);
      if (selectedTab?.id !== tabId) {
        entityTabStore.setTabSelected(tabId);
      }else {
        entityTabStore.selectEntityTab(tabId);
      }
    }

    onUnmounted(() => {
      result.unregister();
      entityTabStore.$dispose();
    });
    return { entityTabs, title,  gotoTab,  defaultHref, entityName, tabId};
  },
});
</script>

<style>
/* .cs-tablist {
  display: flex;
  justify-content: space-between;
  padding-top: 0;
  padding-bottom: 0;
}
.cs-tab-item {
  flex: 1 1 50%; 
  --padding-start: 0;
  border-bottom: 3px solid var(--ion-color-light);
}
.cs-tab-item-selected{
  border-bottom: 3px solid var(--ion-color-success-shade);
}

.cs-tab-icon {
  margin-left: 20px; margin-right: 0.3em;
}
.cs-tab-item-selected > .cs-tab-icon {
  color: var(--ion-color-primary-shade);
}

.cs-tab-item-selected > .cs-tab-label {
color: var(--ion-color-primary-shade);
} */

.entity-list-item {
  --border-color: var(--ion-color-light, #f2f2f2);
}
</style>
