<template>
  <ion-list :class="{ 'ion-hide': !!!records.length }">
    <ion-item v-for="item in records" :key="item.id" class="entity-list-item">
      <ion-label>
        <h2>{{ item.displayName }}</h2>
        <h3>{{ item.colA }}</h3>
        <p>{{ item.colB }}</p>
      </ion-label>
      <ion-icon slot="end" color="medium"></ion-icon>
    </ion-item>
  </ion-list>
  <ion-list :class="{ 'ion-hide': !!records.length }">
    <ion-item v-for="(item, index) in skeletonSize" :key="index">
      <ion-thumbnail slot="start">
        <ion-skeleton-text></ion-skeleton-text>
      </ion-thumbnail>
      <ion-label>
        <h3>
          <ion-skeleton-text animated style="width: 80%"></ion-skeleton-text>
        </h3>
        <p>
          <ion-skeleton-text animated style="width: 60%"></ion-skeleton-text>
        </p>
        <p>
          <ion-skeleton-text animated style="width: 30%"></ion-skeleton-text>
        </p>
      </ion-label>
    </ion-item>
  </ion-list>
</template>

<script lang="ts">
import { useEntityContext } from '@/share';
import { getEntityStore } from '@/share/entity';
import { IonIcon, IonItem, IonLabel, IonList, IonSkeletonText, IonThumbnail } from '@ionic/vue';
import { pulseOutline, radioOutline, scaleOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { defineComponent } from 'vue';


export default defineComponent({
  name: 'EntityList',
  components: {
    IonLabel, IonIcon, IonThumbnail, IonSkeletonText, IonList, IonItem
  },
  setup() {
    const { entityName } = useEntityContext();
    const entityStore = getEntityStore(entityName);
    const { records } = storeToRefs(entityStore);
    const skeletonSize: string[] = Array.from({ length: 12 });

    return { records, scaleOutline, pulseOutline, radioOutline, skeletonSize };
  },
});
</script>

<style>
.entity-list-item {
  --border-color: var(--ion-color-light, #f2f2f2);
}
</style>