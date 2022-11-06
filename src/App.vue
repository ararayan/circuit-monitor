<template>
  <ion-app>
    <ion-router-outlet></ion-router-outlet>
  </ion-app>
</template>

<script lang="ts">
import { useAppStore } from '@/share/hooks/use-app.store';
import { App } from '@capacitor/app';
import { alertController } from '@ionic/core';
import { IonApp, IonRouterOutlet, useBackButton } from '@ionic/vue';
import { defineComponent, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { EmergencyEventsService } from './share/emergency.service';
import { YNAPI_SJCX } from './share/http/url';
import { loadingService } from './share/loading.service';
import { useUserStore } from './share/user/user.store';
import { ignoreBatteryOptimization } from './plugin/ignoreBatteryOptimizationPlugin';
import { Capacitor } from '@capacitor/core';
import { cacheService, StorageType, YNCacheKey } from './share';
import { LocalNotifications } from '@capacitor/local-notifications';

const isNativePlatform = Capacitor.isNativePlatform();

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

    const appStore = useAppStore();
    useUserStore();

    onUnmounted(() => {
      dispose.unregister();
    });

    const emergencyEventsService = EmergencyEventsService.getInstance(cacheService);
    if (isNativePlatform && appStore.localNotificationsPermissions) {
      const url = `${appStore.baseUrl}/${YNAPI_SJCX.GetEmergencyEvents}`;
      emergencyEventsService.startBgCheck(url);
    }
    emergencyEventsService.startFgCheck();
    // const emergencyStore = useEmergencyEvents();
    App.addListener('appUrlOpen', data => appStore.setOperUrl(data.url));
    App.addListener('appRestoredResult', async (data) => {
      // const totke = cacheService.get(YNCacheKey.AccessToken);
      // const alert = await alertController.create({
      //   message: `token: ${totke}, pluginId: ${data.pluginId}, method: ${data.methodName}`,
      // });
      // await alert.present();
    });
    App.addListener('appStateChange', async (appState) => {
      appStore.setActive(appState.isActive);
      if (appState.isActive) {
        if (isNativePlatform) {
          const notified =  await LocalNotifications.getDeliveredNotifications();
          const pending = await  LocalNotifications.getPending();
          const alert = await alertController.create({
            message: `pending: ${pending.notifications.length}, notified: ${notified.notifications.length}, BG Event Total: ${emergencyEventsService.debugEETotal}, BG Fetch Event: ${emergencyEventsService.debugEE}`,
          });
          await alert.present();
        }
      } else {
        await cacheService.save();
      }
    });

  },
  async created() {
    // init loading control for using
    const loading = await loadingService.create({
      cssClass: ['ion-hide']
    });
    await loading.present();

    if (isNativePlatform && !cacheService.get(YNCacheKey.IsRPBatteryOptimization)) {
      const curr = await ignoreBatteryOptimization.checkIgnoreBatteryOptimization();
      if (isNativePlatform && !curr.result) {
        await ignoreBatteryOptimization.requestIgnoreBatteryOptimization();
        const next = await ignoreBatteryOptimization.checkIgnoreBatteryOptimization();
        if (next.result) {
          const appStore = useAppStore();
          appStore.batteryOptimization = next.result;
        }
      }
      cacheService.set(YNCacheKey.IsRPBatteryOptimization, true, StorageType.Persistent);
    }

  }
});
</script>
