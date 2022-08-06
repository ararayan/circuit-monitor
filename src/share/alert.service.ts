import { alertController, AlertOptions  } from '@ionic/vue';


class AlertService {
  async create(options: AlertOptions) {
    const alert =await alertController.create(options);
    await alert.present();
    const didmismiss = await alert.onDidDismiss();
    return didmismiss;
  }
}

const alertService = new AlertService();


export { alertService };
