import { AxiosRequestConfig } from 'axios';
import { CacheKeys, cacheService } from '../cache.service';

function authInterceptor (config: AxiosRequestConfig) {
  const token = cacheService.get(CacheKeys.AccessToken);
  config.headers = config.headers || {};
  config.headers['x-token'] = token;
  return Promise.resolve(config);
}

export { authInterceptor };