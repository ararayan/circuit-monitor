import { router } from '@/router';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { YNCacheKey, cacheService } from '../cache.service';

function authRequestInterceptor (config: AxiosRequestConfig) {
  const token = cacheService.get(YNCacheKey.AccessToken);
  config.headers = config.headers || {};
  config.headers['x-token'] = token;
  return config;
}

async function authResponseErrorInterceptor (error: AxiosResponse) {
  const originalConfig = error.config;
  if (error.status === 401) {
    router.replace({
      path: '/login',
      query: {redirect: router.currentRoute.value.fullPath}
    });
  }
  return Promise.reject(error);
}
export { authRequestInterceptor, authResponseErrorInterceptor };