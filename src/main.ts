import { alertController, IonicVue } from '@ionic/vue';
import { createApp } from 'vue';
import App from './App.vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/display.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
// for vue virtual scroll
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

/* Theme variables */
import { authGuards } from '@/share/auth';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { createPinia } from 'pinia';
import VueVirtualScroller from 'vue-virtual-scroller';
import { router } from './router';
import { useAppStore } from './share/hooks/use-app.store';
import './theme/variables.css';

import { AndroidSettings, NativeSettings } from 'capacitor-native-settings';
import { cacheService } from './share/cache.service';

//#region add global icon
// import { addIcons } from 'ionicons';
// import { closeOutline, checkmarkOutline } from 'ionicons/icons';

// addIcons({
//   closeOutline,
//   checkmarkOutline,
// });

//#endregion


const isNativePlatform = Capacitor.isNativePlatform();


const wairForAppStateActive = () => new Promise<boolean>((resolve) => {
  const _handler = CapacitorApp.addListener('appStateChange', (appState) => {
    if (appState.isActive) {
      resolve(appState.isActive);
      _handler.remove();
    }
  });
});

const initLocalNotifications  = async () => {
  await LocalNotifications.removeAllListeners();
  if (isNativePlatform) {
    const listChannelsResult = await LocalNotifications.listChannels();
    const importanChannel = listChannelsResult.channels.find(x => x.id === 'important_info_channel');
    if (!importanChannel) {
      await LocalNotifications.createChannel({
        id: 'important_info_channel',
        name: 'important_info_channel',
        importance: 5,
        visibility: 1,
      });
    }
  }
};
const loadCacheData = async () => {
  await cacheService.load();
};

async function initializeApp() {
  await loadCacheData();

  router.beforeEach(authGuards);
  
  let localNotificationsPermissions = false;

  if (isNativePlatform) {
    const status = await LocalNotifications.checkPermissions();
    if (status.display !== 'granted') {
      /** 
       * requestPermissions only work in ios, not in andorid, in andorid need popup the message tell the user to turn on the notification on app;
       */
      // const nextStatus =  await LocalNotifications.requestPermissions();
      // if (nextStatus.display === 'granted') {
      //   appStore.localNotificationsPermissions = true;
      // }
      await NativeSettings.openAndroid({
        option: AndroidSettings.AppNotification,
      });
      await wairForAppStateActive();
      const newStatus = await LocalNotifications.checkPermissions();
      localNotificationsPermissions = newStatus.display === 'granted';
    } else {
      localNotificationsPermissions = true;
    }
  }
   
  await initLocalNotifications();

  return {
    localNotificationsPermissions
  };
}

initializeApp().then(({ localNotificationsPermissions }) => {
  const app = createApp(App)
    .use(IonicVue)
    .use(createPinia())
    .use(VueVirtualScroller)
    .use(router);
    
  router.isReady()
    .then(() => {
      const appStore = useAppStore();
      appStore.localNotificationsPermissions = localNotificationsPermissions;
      app.mount('#app');
    });
});





