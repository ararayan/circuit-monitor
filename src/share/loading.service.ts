import { Components } from '@ionic/core';
import { loadingController, LoadingOptions } from '@ionic/vue';
import { AxiosRequestConfig, AxiosResponse } from 'axios';


class LoadingService {
  private count = 0;
  private loading: Components.IonLoading = null as any as Components.IonLoading;
  async show(options?: LoadingOptions) {
    if (this.count > 0 ){
      this.count++;
      return Promise.resolve(this.loading);
    }
    
    this.count++;  
    this.loading = await loadingController
      .create({
        cssClass: 'my-custom-class',
        message: 'Please wait...',
        ...options,
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
    if (!config.params?.skipMask) {
      loadingService.show(config.params?.loadingOptions);
    }
    return config;
  },
  (error: any) => {
    loadingService.hide();
    return Promise.reject(error);
  }
];

const loadingResponseInterceptor = [
  (response: AxiosResponse) => {
    if (!response.config.params?.skipMask) {
      loadingService.hide();
    }
    return response;
  }, (error: any) => {
    loadingService.hide();
    return Promise.reject(error);
  }
];

export { loadingService, loadingRequestInterceptor, loadingResponseInterceptor };
