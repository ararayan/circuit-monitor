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
      <!-- <ion-list :scroll-y="false" style="height: 100%">
        <RecycleScroller class="scroller ion-content-scroll-host" :items="records" :item-size="60" key-field="seq"
          ref="virtualScroller">
          <template #default="{ item }">
            <ion-item> <ion-label>{{ item.text }}</ion-label> </ion-item>
          </template>
        </RecycleScroller>
      </ion-list> -->
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { defineComponent } from 'vue';


export default defineComponent({
  name: 'EmergencyEventsView',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons, IonBackButton,
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

