import { onIonViewWillEnter, onIonViewDidEnter, onIonViewWillLeave, onIonViewDidLeave, } from '@ionic/vue';
import { ref } from 'vue';

/**
 * @description ionic life cycle only working component which has ion-page and navigate by ion-route-outlet
 * 
 */
const useIonicPageLifecycle = () => {
  const lifecycle = ref('');
  onIonViewWillEnter(() => {
    // ionic view will enter;
    lifecycle.value ='ViewWillEnter';
  });
  onIonViewDidEnter(() => {
    // ionic view did enter;
    lifecycle.value ='ViewDidEnter';
  });
  onIonViewWillLeave(() => {
    // ionic view will leave;
    lifecycle.value ='ViewWillLeave';
  });
  onIonViewDidLeave(() => {
    // ionic view did leave;
    lifecycle.value ='ViewDidLeave';
  });
  return lifecycle;
};


export { useIonicPageLifecycle };