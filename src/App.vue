<template>
  <ion-app>
    <router-view />
  </ion-app>
</template>

<script lang="ts">
import { IonApp } from '@ionic/vue';
import { defineComponent, onUnmounted } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useBackButton } from '@ionic/vue';
import { App } from '@capacitor/app';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    RouterView
  },  
  // async created() {
  //   return Promise.resolve(true).then(() => {
  //     // debugger;
  //   });
  // },
  setup() {
    const route = useRoute();
    const dispose = useBackButton(-1, (next) => {
      if (route.path.includes('/home') || route.path.includes('/login')) {
        alert('exit app');
        App.exitApp();
      }
      alert('check whether is exit app!!!');
      next();
    });
    onUnmounted(() => {
      dispose.unregister();
    });
  }
});
</script>