<template>
  <ion-app>
    <router-view />
  </ion-app>
</template>

<script lang="ts">
import { IonApp } from '@ionic/vue';
import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    RouterView
  },  
  async created() {
    return Promise.resolve(true).then(() => {
      // debugger;
    });
  }
});
</script>