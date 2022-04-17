<template>
  <ion-page class="segments-view">
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>List</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <ion-list>
        <ion-list-header> Recent Conversations </ion-list-header>
        <template v-for="item in records" :key="item.id">
          <ion-item>
            <ion-avatar slot="start">
              <img :src="item.avatar" />
            </ion-avatar>
            <ion-label>
              <h2>{{item.displayName}}</h2>
              <h3>{{item.colA}}</h3>
              <p>{{item.colB}}</p>
            </ion-label>
          </ion-item>
        </template>     
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { createEntityStore } from '@/share/entity';
import { IonPage, IonHeader, IonContent, IonToolbar, IonTitle, IonAvatar, IonLabel, IonItem, IonList, IonListHeader } from '@ionic/vue';
import { storeToRefs } from 'pinia';
import { defineComponent } from 'vue';

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
    IonListHeader
  },
  setup() {
    const store = createEntityStore('segments');
    store.getRecords();
    const { records } = storeToRefs(store);
    return {
      records
    };
  }
});
</script>
