import { Components } from '@ionic/core';
import { loadingController } from '@ionic/vue';
import { AxiosRequestConfig, AxiosResponse } from 'axios';


class LoadingService {
  private count = 0;
  private loading: Components.IonLoading = null as any as Components.IonLoading;
  async show() {
    if (this.count > 0 ){
      this.count++;
      return Promise.resolve(this.loading);
    }
    
    this.count++;  
    this.loading = await loadingController
      .create({
        cssClass: 'my-custom-class',
        message: 'Please wait...',
        // duration: this.timeout,
      });
    
    await this.loading.present();
    return this.loading;
  }
  async hide() {
    this.count = this.count === 0 ? this.count : this.count - 1;
    if (this.count === 0) {
      if (this.loading){
        await this.loading.dismiss();
        return true;
      }
      return true;
    }
    return Promise.resolve(false);
    
  }
}

const loadingService = new LoadingService();

const loadingRequestInterceptor = [
  (config: AxiosRequestConfig) => {
    loadingService.show();
    return config;
  },
  (error: any) => {
    loadingService.hide();
    return Promise.reject(error);
  }
];

const loadingResponseInterceptor = [
  (config: AxiosResponse) => {
    loadingService.hide();
    return config;
  }, (error: any) => {
    loadingService.hide();
    return Promise.reject(error);
  }
];

export { loadingService, loadingRequestInterceptor, loadingResponseInterceptor };
