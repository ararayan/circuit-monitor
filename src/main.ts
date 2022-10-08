import { IonicVue } from '@ionic/vue';
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
import { LocalNotifications } from '@capacitor/local-notifications';
import { createPinia } from 'pinia';
import VueVirtualScroller from 'vue-virtual-scroller';
import { router } from './router';
import { useAppStore } from './share/hooks/use-app.store';
import { loadingService } from './share/loading.service';
import './theme/variables.css';

//#region add global icon
// import { addIcons } from 'ionicons';
// import { closeOutline, checkmarkOutline } from 'ionicons/icons';

// addIcons({
//   closeOutline,
//   checkmarkOutline,
// });

//#endregion

router.beforeEach(authGuards);

const app = createApp(App)
  .use(IonicVue)
  .use(createPinia())
  .use(VueVirtualScroller)
  .use(router);

async function initializeApp() {
  const status = await LocalNotifications.checkPermissions();
  const appStore = useAppStore();
  if (status.display !== 'granted') {
    /** 
     * requestPermissions only work in ios, not in andorid, in andorid need popup the message tell the user to turn on the notification on app;
     */
    const nextStatus =  await LocalNotifications.requestPermissions();
    if (nextStatus.display === 'granted') {
      appStore.localNotificationsPermissions = true;
    }
    // alertController.create({
    //   header: '提示',
    //   message: '请打开通知权限。'
    // }).then(x => x.present());
  }

  // init loading control for using
  const loading = await loadingService.create({
    cssClass: ['ion-hide']
  });
  await loading.present();
  return true;
}

router.isReady()
  .then(() => initializeApp())
  .then(() => {
    app.mount('#app');
  });

