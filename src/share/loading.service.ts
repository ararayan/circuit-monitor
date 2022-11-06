import { useAppStore } from '@/share/hooks/use-app.store';
import { Components } from '@ionic/core';
import { loadingController, LoadingOptions } from '@ionic/vue';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { alertService } from './alert.service';


function isNetworkError(err: AxiosError) {
  return !!err.isAxiosError && !err.response;
}

class LoadingService {
  private _defaultLoadingText = '正在查询，请稍候...';
  private _count = 0;
  private _loadingControl: Components.IonLoading = null as any as Components.IonLoading;
  async create(options?: LoadingOptions) {
    this._loadingControl = await loadingController
      .create({
        cssClass: ['loading-wrapper'],
        message: this._defaultLoadingText,
        ...options,
      });
    return this._loadingControl;
  }
  show(options?: LoadingOptions) {
    this._count++;

    if (this._loadingControl.cssClass?.includes('ion-hide')) {
      this._loadingControl.cssClass = (this._loadingControl.cssClass as string[]).splice(0, this._loadingControl.cssClass.indexOf('ion-hide'));
    }
    this._loadingControl.message = options?.message ? options.message : this._defaultLoadingText;
    this._loadingControl.present();
  }
  async hide() {
    this._count = this._count === 0 ? this._count : this._count - 1;

    if (this._count === 0 && this._loadingControl) {
      if (!this._loadingControl?.cssClass?.includes('ion-hide')) {
        this._loadingControl.cssClass = [...(this._loadingControl?.cssClass as string[] || []), 'ion-hide'];
      }
    }
  }
  empty() {
    this._count = 0;
    const previous = this._loadingControl;
    this._loadingControl = null as any as Components.IonLoading;
    previous?.dismiss();
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
    // if (!error.config?.headers?.errorSilent) {
    //   alertService.create({
    //     header: '提示',
    //     message: error?.message || '未知网络错误！',
    //     buttons: ['OK']
    //   });
    // }else {
    //   appStore.logError({
    //     url: error.config.url || '',
    //     params: Object.fromEntries(new URLSearchParams(error.config.data || '')),
    //     msg: error?.message,
    //   });
    // }

    appStore.logError({
      url: error.config?.url || '',
      params: Object.fromEntries(new URLSearchParams(error.config?.data || '')),
      msg: error.message,
    });
    return Promise.reject(error);
  }
];

export { loadingService, loadingRequestInterceptor, loadingResponseInterceptor };
