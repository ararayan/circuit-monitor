<template>
  <ion-app>
    <ion-router-outlet></ion-router-outlet>
  </ion-app>
</template>

<script lang="ts">
import { useAppStore } from '@/share/hooks/use-app.store';
import { useEmergencyEvents } from '@/share/hooks/use-emergency-events.store';
import { App } from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { IonApp, IonRouterOutlet, useBackButton } from '@ionic/vue';
import { defineComponent, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { alertService } from '@/share/alert.service';
import { toastService } from '@/share/toast.service';
import { loadingService } from '@/share/loading.service';
// import { alertController } from '@ionic/core';

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
      App.addListener('appStateChange', (appState) => {
        if (!appState.isActive) {
          alertService.empty();
          loadingService.empty();
          toastService.empty();
        }
        // else {
        //   alertController.create({
        //     message: `alertControlsCount = ${alertService._controls.length};
        //     toastControlCount =  ${toastService._controls.length};
        //     hasLoadingControl =  ${loadingService.loadingControl ? 1 : 0};
        //     loadingControlCount = ${loadingService.count}`,
            
        //   }).then(test => {
        //     return test.present();
        //   });
        // }
        appStore.setActive(appState.isActive);
      }),
    );

    const emergencyEventsStore = useEmergencyEvents();
    emergencyEventsStore.check();

    onUnmounted(async () => {
      dispose.unregister();
      await Promise.all(appSubscriptions.map(subscription => subscription.remove()));
    });
  },
  async created() {
    const status = await LocalNotifications.checkPermissions();
    const appStore = useAppStore();
    if (status.display !== 'granted') {
      const nextStatus =  await LocalNotifications.requestPermissions();
      if (nextStatus.display === 'granted') {
        appStore.localNotificationsPermissions = true;
      }
    }else {
      // test in browse, comment below line for show notification in toast
      appStore.localNotificationsPermissions = true;
    }
  },
});
</script>
