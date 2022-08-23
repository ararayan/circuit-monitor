<template>
  <ion-app>
    <ion-router-outlet></ion-router-outlet>
  </ion-app>
</template>

<script lang="ts">
import { useAppStore } from '@/share/hooks/use-app.store';
import { App } from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';
import { IonApp, IonRouterOutlet, useBackButton } from '@ionic/vue';
import { defineComponent, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet,
  },
  setup() {
    const route = useRoute();
    const dispose = useBackButton(-1, (next) => {
      if (route.path.includes('/home') || route.path.includes('/login')) {
        App.minimizeApp();
      } else {
        next();
      }

    });
    const appSubscriptions:  Array<Promise<PluginListenerHandle> & PluginListenerHandle> = [];
    const appStore = useAppStore();
    appSubscriptions.push(
      App.addListener('appUrlOpen', data => appStore.setOperUrl(data.url)),
      App.addListener('appRestoredResult', data => console.log('Restored state:', data)),
      App.addListener('appStateChange', (appState) => appStore.setActive(appState.isActive)),
    );
    onUnmounted(async () => {
      dispose.unregister();
      await Promise.all(appSubscriptions.map(subscription => subscription.remove()));
    });
  }
  // async created() {
  //   return Promise.resolve(true).then(() => {
  //     debugger;
  //   });
  // },
});
</script>
