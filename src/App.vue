<template>
  <ion-app>
    <ion-router-outlet></ion-router-outlet>
  </ion-app>
</template>

<script lang="ts">
import { useAppStore } from '@/share/hooks/use-app.store';
import { App } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { alertController } from '@ionic/core';
import { IonApp, IonRouterOutlet, useBackButton } from '@ionic/vue';
import { defineComponent, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { bgEmergencyEventCount, emergencyEventsService } from './share/emergency.service';
import { YNAPI_SJCX } from './share/http/url';
import { loadingService } from './share/loading.service';
import { useUserStore } from './share/user/user.store';
import { ignoreBatteryOptimization } from './plugin/ignoreBatteryOptimizationPlugin';
import { Capacitor } from '@capacitor/core';

// let emergencyEventsRecords = [] as any;
// let notifyCount = 0;
// const startBackgroundFetch = async (url: string, payload: {startIndex: string, recordName: string}) => {
//   const prevStatus = await BackgroundFetch.status();
//   if (prevStatus === BackgroundFetch.STATUS_AVAILABLE) {
//     alertController.create({message: 'Prev BackgroundFetch status avaliable!!!'}).then(x => x.present());
//   }

//   let {startIndex, recordName} = payload; 
//   const status = await BackgroundFetch.configure({
//     minimumFetchInterval: 15,
//     stopOnTerminate: false,
//     enableHeadless: true,
//     forceAlarmManager: true,
//   }, async (taskId) => {
//     try {
//       const response = await Http.post({
//         url,
//         headers: {
//           ['content-type']: 'application/x-www-form-urlencoded',
//           token: '',
//         },
//         connectTimeout: 5 * 1000,
//         responseType: 'json',
//         data: new URLSearchParams({startIndex, recordName})
//       });

//       if (response.status === 200) {
//         // successful
//         startIndex = response.data.startIndex;
//         emergencyEventsRecords = [...emergencyEventsRecords, {seq: notifyCount,  message: '测试突发事件' }];
//       }
//     } catch(err) {
//       // todo
//     }

//     notifyCount++;

//     const notifyId = notifyCount;
//     await LocalNotifications.schedule({
//       notifications: [{
//         schedule: {
//           // allowWhileIdle: true,
//           at: new Date(Date.now() + 1500 ), // in a minute
//           repeats: false,
//         },
//         id: notifyId,
//         title: `${taskId} ${notifyId}`,
//         body: `${taskId} ${notifyId}`,
//         channelId: 'important_info_channel',
//         ongoing: true,
//         // group: taskId, // need setGroup
//       }]
//     });
//     BackgroundFetch.finish(taskId);
//   }, async (taskId) => {
//     // The OS has signalled that your remaining background-time has expired.
//     // You must immediately complete your work and signal #finish.
//     // [REQUIRED] Signal to the OS that your work is complete.
//     console.log('xxx: BackgroundFetch Timeout');
//     BackgroundFetch.finish(taskId);
//   });
//   // Checking BackgroundFetch status:
//   if (status !== BackgroundFetch.STATUS_AVAILABLE) {
//     // Uh-oh:  we have a problem:
//     if (status === BackgroundFetch.STATUS_DENIED) {
//       console.log('The user explicitly disabled background behavior for this app or for the whole system.');
//     } else if (status === BackgroundFetch.STATUS_RESTRICTED) {
//       console.log('Background updates are unavailable and the user cannot enable them again.');
//     }
//   } else {
//     alertController.create({message: 'Curr BackgroundFetch Start'}).then(x => x.present());
//   }

// };

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
    if (appStore.isNativePlatform && appStore.localNotificationsPermissions) {
      const url = `${appStore.baseUrl}/${YNAPI_SJCX.GetEmergencyEvents}`;
      emergencyEventsService.startBgCheck(url);
    }
    // const emergencyStore = useEmergencyEvents();
    App.addListener('appUrlOpen', data => appStore.setOperUrl(data.url));
    App.addListener('appRestoredResult', data => console.log('Restored state:', data));
    App.addListener('appStateChange', async (appState) => {
      appStore.setActive(appState.isActive);
      if (appState.isActive) {
        if (appStore.isNativePlatform) {
          const notified =  await LocalNotifications.getDeliveredNotifications();
          const pending = await  LocalNotifications.getPending();
          const alert = await alertController.create({
            message: `pending: ${pending.notifications.length}, notified: ${notified.notifications.length}, BG Event Count: ${bgEmergencyEventCount}`,
          });
          await alert.present();
        }
      }
    });

  },
  async created() {
    // init loading control for using
    const loading = await loadingService.create({
      cssClass: ['ion-hide']
    });
    await loading.present();

    const curr = await ignoreBatteryOptimization.checkIgnoreBatteryOptimization();
    const isNativePlatform = Capacitor.isNativePlatform();
    if (isNativePlatform && !curr.result) {
      await ignoreBatteryOptimization.requestIgnoreBatteryOptimization();
      const next = await ignoreBatteryOptimization.checkIgnoreBatteryOptimization();
      if (next.result) {
        const appStore = useAppStore();
        appStore.batteryOptimization = next.result;
      }
    }
  }
});
</script>
