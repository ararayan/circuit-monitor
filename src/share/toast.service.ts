import { toastController, ToastOptions  } from '@ionic/vue';
import { Components } from '@ionic/core';


class ToastService {
  private _controls: Components.IonToast[] = [];
  async create(options: ToastOptions) {
    const toast = await toastController.create(options);
    this._controls.push(toast);
    await toast.present();
    const didmismiss = await toast.onDidDismiss();
    return didmismiss;
  }
  pop() {
    if (this._controls.length) {
      const latest = this._controls.splice(this._controls.length - 1, 1)[0];
      if (latest) {
        latest.dismiss();
      }
    }
  }
  empty() {
    const copy = this._controls.slice(0);
    this._controls = [];
    copy.forEach(item => item?.dismiss());
  }
}

const toastService = new ToastService();


export { toastService };
