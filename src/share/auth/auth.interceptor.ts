import { router } from '@/router';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { YNCacheKey, cacheService } from '../cache.service';

const authRequestInterceptor = [
  (config: AxiosRequestConfig) => {

    const token = cacheService.get(YNCacheKey.AccessToken);
    config.headers = config.headers || {};
    if (token) {
      config.headers['x-token'] = token;
    }

    return config;
  },
  (error: any) => {

    return error;
  }
];

const authResponseInterceptor = [
  async (response:AxiosResponse) => {
    return response;
  },
  async (error: AxiosResponse) => {

    const originalConfig = error.config;
    if (error.status === 401) {
      router.replace({
        path: '/login',
        query: {redirect: router.currentRoute.value.fullPath}
      });
    }

    return Promise.reject(error);
  }
];

export { authRequestInterceptor, authResponseInterceptor };
