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
    <ion-content fullscreen >
      <ion-list v-for="item in records" :key="item.id">
        <ion-item @click="openRecord(item)" >
          <ion-label>
            <h2>{{ item.name }}</h2>
            <h3>{{ item.note }}</h3>
          </ion-label>
          <ion-icon :icon="chevronForwardOutline" slot="end" color="medium"></ion-icon>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">

import { EntityRecord, useEntityContext, useEntityDisplayName, useEntityRecordsStore } from '@/share';
import {
  IonBackButton, IonButtons,
  IonContent, IonHeader, IonIcon, IonItem,
  IonLabel, IonList, IonPage, IonTitle, IonToolbar, useIonRouter
} from '@ionic/vue';
import { chevronForwardOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { defineComponent, onUnmounted } from 'vue';

export default defineComponent({
  name: 'WiringsView',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonContent,
    IonLabel, IonButtons, IonBackButton, IonIcon
  },
  setup() {
    const router = useIonRouter();
    const { entityName } = useEntityContext();
    const { title } = useEntityDisplayName(entityName);
    const recordStore = useEntityRecordsStore(entityName);
    const { records, pagination } = storeToRefs(recordStore);

    function openRecord(item: EntityRecord) {
      const recordId = item.id;
      recordStore.setOpenRecord(recordId);
      router.push(`/entity/${entityName}/${recordId}`);
    }
    recordStore.getRecords(entityName, { isInit: true });

    onUnmounted(() => {
      recordStore.$dispose();
    });
    return {
      openRecord, entityName, pagination,
      records, title, chevronForwardOutline
    };
  },
});
</script>
