<template>
  <ion-page>
    <ion-content>
         <ion-label>404</ion-label>
    </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonLabel } from '@ionic/vue';

export default defineComponent({
  name: 'NotFoundView',
  components: { IonPage, IonContent, IonLabel },
});
</script>