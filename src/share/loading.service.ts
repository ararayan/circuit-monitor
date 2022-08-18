import { Components } from '@ionic/core';
import { loadingController, LoadingOptions } from '@ionic/vue';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAppStore } from '@/share/hooks/use-app.store';


function isNetworkError(err: AxiosError) {
  return !!err.isAxiosError && !err.response;
}

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

    const appStore = useAppStore();
    appStore.setLoadingCount(this.count);

    await this.loading.present();
    return this.loading;
  }
  async hide() {
    this.count = this.count === 0 ? this.count : this.count - 1;

    const appStore = useAppStore();
    appStore.setLoadingCount(this.count);

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
    if (!config.headers?.skipMask) {
      loadingService.show();
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
    if (!response.config.headers?.skipMask) {
      loadingService.hide();
    }
    return response;
  }, (error: any) => {
    loadingService.hide();
    if (isNetworkError(error as AxiosError)) {
      const appStore = useAppStore();
      appStore.setNetWorkError();
    }
    
    return Promise.reject(error);
  }
];

export { loadingService, loadingRequestInterceptor, loadingResponseInterceptor };
