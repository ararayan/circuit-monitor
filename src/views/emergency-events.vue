<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar mode="md" color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title center>突发事件</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen :scroll-y="false">
      <ion-list :scroll-y="false" style="height: 100%">
        <RecycleScroller class="scroller ion-content-scroll-host" :items="records" :item-size="80" key-field="seq"
          ref="virtualScroller">
          <template #default="{ item }">
            <ion-item>
              <ion-label>
                <i class="seq-number">{{ item.seq || '' }}</i>
                <span>{{ item.message }}</span>
              </ion-label>
            </ion-item>
          </template>
        </RecycleScroller>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonBackButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { arrowBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { defineComponent, ref } from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';


export default defineComponent({
  name: 'EmergencyEventsView',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonContent,
    IonLabel,
    RecycleScroller, IonButtons, IonBackButton,
  },
  setup() {
    const records = ref([]);
  
    return {
      records, arrowBackOutline, chevronForwardOutline
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
.seq-number {
  margin-right: 1em;
  color: var(--ion-color-medium);
}
.seq-number:empty {
  margin-right: 0;
}
</style>

