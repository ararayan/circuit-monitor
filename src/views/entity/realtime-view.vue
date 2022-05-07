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
    <ion-content>
      <entity-list></entity-list>
    </ion-content>
    <ion-footer>
      <entity-tab :tabList="entityTabs" @goto-tab="gotoTab($event)"></entity-tab>
    </ion-footer>

  </ion-page>
</template>

<script lang="ts">
import EntityList from '@/components/entity-list.vue';
import EntityTab from '@/components/entity-tab.vue';
import { destoryEntityStore } from '@/share/entity';
import { useEntityContext, useEntityDisplayName, useEntityTab } from '@/share/hooks';
import { IonBackButton, IonButtons, IonContent, IonFooter, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { defineComponent, onUnmounted } from 'vue';


export default defineComponent({
  name: 'RealtimeView',
  components: {
    IonPage,  EntityTab, EntityList,
    IonFooter, IonContent, IonToolbar, IonTitle, IonButtons, IonHeader, IonBackButton
  },
  setup() {
    const { entityName } = useEntityContext();
    const { gotoTab, entityTabs } = useEntityTab(entityName);
    const { title } = useEntityDisplayName(entityName);
    onUnmounted(() => {
      destoryEntityStore(entityName);
    });
    return { title, gotoTab, entityTabs };
  },
});
</script>

<style>
.entity-list-item {
  --border-color: var(--ion-color-light, #f2f2f2);
}
</style>