import axios, { AxiosInstance, AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse } from 'axios';
import { from, Observable } from 'rxjs';
import { authRequestInterceptor, authResponseInterceptor } from '../auth';
import { loadingRequestInterceptor, loadingResponseInterceptor } from '../loading.service';
import { YN_BASE_URL } from './url';


const YNAxios = axios.create({
  baseURL: YN_BASE_URL,
  headers: {
    ['content-type']: 'application/x-www-form-urlencoded'
  }
});

// stack, LIFO
YNAxios.interceptors.request.use(...authRequestInterceptor);
// convert postdata to URLSearchParams    
YNAxios.interceptors.request.use((config: AxiosRequestConfig) => {
  if (config.method === 'post' && Object.keys(config?.data).length) {
    config.data = new URLSearchParams(config.data);
  }

  return config;  
});
YNAxios.interceptors.request.use(...loadingRequestInterceptor);


// queue
YNAxios.interceptors.response.use(...authResponseInterceptor);
YNAxios.interceptors.response.use(...loadingResponseInterceptor);

// function fixConfig<T = any>(config?: AxiosRequestConfig<T> ) {
//   //#region handle auth header;
//   const resultConfig = config ? config : Object.create(null) as AxiosRequestConfig<T>;
//   resultConfig.headers = resultConfig.headers ? resultConfig.headers : Object.create(null) as AxiosRequestHeaders;
//   resultConfig.headers = {
//     ['token']: cacheService.get(YNCacheKey.AccessToken) || '',
//     ...resultConfig.headers
//   };
//   //#endregion

//   return resultConfig;  
// }


export const httpService =  {
  setBaseUrl(url: string) {
    YNAxios.defaults.baseURL = url;
  },
  // get<T = any>(url: string, config?: AxiosRequestConfig<T>) {
  //   return from(_axios.get(APP_URL.Base + url, fixConfig(config)));
  // },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  get<T = any>(url: string,  config?: AxiosRequestConfig):Observable<AxiosResponse<T>> {
    return from(YNAxios.get(url, config) as Promise<AxiosResponse<T>>);
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  post<T = any>(url: string, data: Record<string, any> = {}, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    // return of({} as T).pipe(delay(100));
    return from(YNAxios.post(url, data, config) as Promise<AxiosResponse<T>>);
  },
  addRequestInterceptor(...args: [...Parameters<AxiosInterceptorManager<AxiosRequestConfig>['use']>, AxiosInstance?]) {
    const instance = args[2];
    (instance || YNAxios).interceptors.request.use(...[args[0], args[1]]);
  }
};


