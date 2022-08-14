<template>
  <ion-page mode="md">
    <ion-header translucent>
      <ion-toolbar mode="md" color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title center>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen>
      <ion-list v-for="item in records" :key="item.id">
        <ion-item @click="openRecord(item)" class="entity-list-item">
          <ion-label>
            <h2>{{ item.name }}</h2>
          </ion-label>
          <ion-icon :icon="chevronForwardOutline" slot="end" color="medium"></ion-icon>
        </ion-item>
      </ion-list>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { Entities, useEntityContext, useEntityDisplayName } from '@/share';
import { EntityRecord, useEntityRecordsStore, useEntityRelationStore } from '@/share/entity';
import { IonButtons, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonBackButton, IonHeader, IonTitle, IonToolbar, useBackButton, useIonRouter
} from '@ionic/vue';
import { arrowBackOutline, chevronForwardOutline, searchCircleOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { defineComponent, onUnmounted } from 'vue';
/* 
  ion-content-scroll-host
  Ionic Framework requires that features such as collapsible large titles,
  ion-infinite-scroll, ion-refresher, and ion-reorder-group be used within an ion-content.
  To use these experiences with virtual scrolling, you must add the .ion-content-scroll-host class to the virtual scroll viewport.
*/

export default defineComponent({
  name: 'SegmentsView',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonContent, IonBackButton,
    IonLabel, IonButtons, IonIcon
  },
  setup() {
    const router = useIonRouter();
    const { entityName } = useEntityContext();

    const { title } = useEntityDisplayName(entityName);

    const recordStore = useEntityRecordsStore(entityName);
    const { records } = storeToRefs(recordStore);

    const relationEntityStore = useEntityRelationStore(entityName);
    const { editViewEntityName } = storeToRefs(relationEntityStore);



    function openRecord(item: EntityRecord) {
      if (editViewEntityName.value !== entityName) {
        const parentRecordId = item.id;
        const parentEntityName = entityName;
        router.push(`/entity/${parentEntityName}/${parentRecordId}/${editViewEntityName.value}`);
      } else {
        const recordId = item.id;
        router.push(`/entity/${entityName}/${recordId}`);
      }
    }

    const result = useBackButton(11, (next) => {
      next();
    });

    // init 
    relationEntityStore.setEditViewRelateEntity(Entities.SegmentsChild);
    recordStore.getRecords(entityName, { isInit: true });

    onUnmounted(() => {
      result.unregister();
      recordStore.destroy();
      relationEntityStore.destroy();
    });

    return {
      openRecord, entityName, 
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

.entity-list-item {
  --border-color: var(--ion-color-light, #f2f2f2);
}
</style>
