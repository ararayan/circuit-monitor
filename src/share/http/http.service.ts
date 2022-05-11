import axios, { AxiosInstance, AxiosInterceptorManager, AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { delay, from, Observable, of, catchError } from 'rxjs';
import { authRequestInterceptor } from '../auth';
import { YNCacheKey, cacheService } from '../cache.service';
import { loadingService } from '../loading-service';
import { APP_URL } from './url';

const _axios = axios.create({
  baseURL: APP_URL.Base,
});
 
_axios.interceptors.request.use((config) => {
  loadingService.show();
  return config;
}, (error) => {
  debugger;
  loadingService.hide();
  return Promise.reject(error);
});
_axios.interceptors.request.use(authRequestInterceptor, (error) => {
  debugger;
  return Promise.reject(error);
});

_axios.interceptors.response.use((config) => {
  debugger;
  loadingService.hide();
  return config;
}, (error) => {
  debugger;
  loadingService.hide();
  return Promise.reject(error);
});
// _axios.interceptors.response.use(authRequestInterceptor, (error) => Promise.reject(error));


function fixConfig<T = any>(config?: AxiosRequestConfig<T> ) {
  //#region handle auth header;
  const resultConfig = config ? config : Object.create(null) as AxiosRequestConfig<T>;
  resultConfig.headers = resultConfig.headers ? resultConfig.headers : Object.create(null) as AxiosRequestHeaders;
  resultConfig.headers = {
    ['x-token']: cacheService.get(YNCacheKey.AccessToken) || '',
    ...resultConfig.headers
  };
  //#endregion

  return config;  
}


export const httpService =  {
  // get<T = any>(url: string, config?: AxiosRequestConfig<T>) {
  //   return from(_axios.get(APP_URL.Base + url, fixConfig(config)));
  // },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  get<T = any>(url: string, headers: Record<string, string | number | boolean>): Observable<T> {
    return from(_axios.get(APP_URL.Base + url) as Promise<T>);
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  post<T = any, K = any>(url: string, data?: any, config?: AxiosRequestConfig<K>): Observable<T> {
    return of({} as T).pipe(delay(100));
    // return from(_axios.post(url, data) as Promise<T>).pipe(catchError(() => of([] as any as T)), delay(500));
  },
  addRequestInterceptor(...args: [...Parameters<AxiosInterceptorManager<AxiosRequestConfig>['use']>, AxiosInstance?]) {
    const instance = args[2];
    (instance || _axios).interceptors.request.use(...[args[0], args[1]]);
  }
};

