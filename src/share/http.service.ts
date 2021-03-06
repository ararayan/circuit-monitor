import axios, { AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { from, Observable, of } from 'rxjs';
import { CacheKeys, cacheService } from './cache.service';
import { APP_URL } from './url';

const _axios = axios.create({
  baseURL: APP_URL.Base,
});
  

function fixConfig<T = any>(config?: AxiosRequestConfig<T> ) {
  //#region handle auth header;
  const resultConfig = config ? config : Object.create(null) as AxiosRequestConfig<T>;
  resultConfig.headers = resultConfig.headers ? resultConfig.headers : Object.create(null) as AxiosRequestHeaders;
  resultConfig.headers = {
    ['x-token']: cacheService.get(CacheKeys.AccessToken) || '',
    ...resultConfig.headers
  };
  //#endregion

  return config;  
}


export const httpService =  {
  get<T = any>(url: string, config?: AxiosRequestConfig<T>) {
    return from(_axios.get(APP_URL.Base + url, fixConfig(config)));
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  post<T = any, K = any>(url: string, data?: any, config?: AxiosRequestConfig<K>): Observable<T> {
    return of({} as T);
    // return from(_axios.post(url, data, fixConfig(config)));
  },
};