import { alertController, AlertOptions  } from '@ionic/vue';
import { Components } from '@ionic/core';


class AlertService {
  _controls: Components.IonAlert[] = [];
  async create(options: AlertOptions) {
    const alert = await alertController.create(options);
    this._controls.push(alert);
    await alert.present();
    const didmismiss = await alert.onDidDismiss();
    return didmismiss;
  }
  pop() {
    if (this._controls.length) {
      const lastAlert = this._controls.splice(this._controls.length - 1, 1)[0];
      if (lastAlert) {
        lastAlert.dismiss();
      }
    }
  }
  empty() {
    const copy = this._controls.slice(0);
    this._controls = [];
    copy.forEach(item => item.dismiss());
  }
}

const alertService = new AlertService();


export { alertService };
