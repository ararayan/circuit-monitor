<template>
  <ion-app>
    <router-view />
  </ion-app>
</template>

<script lang="ts">
import { IonApp } from '@ionic/vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
  },  
  async created() {
    return Promise.resolve(true).then(() => {
      debugger;
    });
  }
});
</script>