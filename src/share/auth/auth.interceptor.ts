import { router } from '@/router';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { YNCacheKey, cacheService } from '../cache.service';
import { useUserStore } from '../user';


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
  async (error: any) => {
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
