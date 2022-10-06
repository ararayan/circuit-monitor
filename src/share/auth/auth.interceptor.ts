import { router } from '@/router';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { YNCacheKey, cacheService } from '../cache.service';
import { useUserStore } from '../user';

function isNetworkError(err: AxiosError) {
  return !!err.isAxiosError && !err.response;
}

const authRequestInterceptor = [
  (config: AxiosRequestConfig) => {
    const token = cacheService.get(YNCacheKey.AccessToken);
    config.headers = config.headers || {};
    if (token) {
      config.headers['token'] = token;
    }

    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
];

const authResponseInterceptor = [
  (response:AxiosResponse) => {
    return response;
  },
  (error: any) => {
    const isNetWorkError = isNetworkError(error);
    if (isNetWorkError) {
      error.message = '网络出错，请稍候重试。';
    }
    const status = (error as AxiosError)?.response?.status;
    if (status === 401) {
      const userStore = useUserStore();
      userStore.resetUserInfo();
      cacheService.remove(YNCacheKey.AccessToken);
      cacheService.remove(YNCacheKey.User);
      router.replace({
        path: '/login',
        query: {redirect: router.currentRoute.value.fullPath}
      });
    }

    return Promise.reject(error);
  }
];

export { authRequestInterceptor, authResponseInterceptor };
