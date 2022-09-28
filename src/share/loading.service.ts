import { Components } from '@ionic/core';
import { loadingController, LoadingOptions } from '@ionic/vue';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAppStore } from '@/share/hooks/use-app.store';
import { alertService } from './alert.service';


function isNetworkError(err: AxiosError) {
  return !!err.isAxiosError && !err.response;
}

class LoadingService {
  private count = 0;
  private loadingControl: Components.IonLoading = null as any as Components.IonLoading;
  async show(options?: LoadingOptions) {
    if (this.count > 0 ){
      this.count++;
      await this.loadingControl;
      return this.loadingControl;
    }
    
    this.count++;  
    this.loadingControl = await loadingController
      .create({
        cssClass: 'loading-wrapper',
        message: '正在查询，请稍候...',
        ...options,
      });
    
    const appStore = useAppStore();
    appStore.setLoadingCount(this.count);

    // check the this.count again, may network was very fast, the response is back and hide loading been called;
    if (this.count === 0) {
      return null;
    }

    await this.loadingControl.present();
    return this.loadingControl;
  }
  async hide() {
    this.count = this.count === 0 ? this.count : this.count - 1;

    const appStore = useAppStore();
    appStore.setLoadingCount(this.count);

    if (this.count === 0) {
      if (this.loadingControl){
        await this.loadingControl.dismiss();
        return true;
      }
      return true;
    }
    return false;
    
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
  }, (err: any) => {
    const error: AxiosError = err as AxiosError;
    loadingService.hide();
    const appStore = useAppStore();
    if (isNetworkError(error)) {
      appStore.setNetWorkError();
    }
    if (!error.config?.headers?.errorSilent) {
      alertService.create({
        header: '提示',
        message: error?.message || '未知网络错误！',
        buttons: ['OK']
      });
    }else {
      appStore.logError({
        url: error.config.url || '',
        params: error.config.data?.toString(),
        msg: error?.message,
      });
    }
   
    return Promise.reject(error);
  }
];

export { loadingService, loadingRequestInterceptor, loadingResponseInterceptor };
