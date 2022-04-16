const enum CacheKeys {
    User = 'YN:User',
    AccessToken = 'YN:TOKEN',
}
class CacheService {
  get(key: string) {
    const stringVal =  localStorage.getItem(key);
    if (stringVal) {
      return JSON.parse(stringVal);
    }
    return stringVal;
  }
  set(key: string, value: any) {
    localStorage.setItem(key, typeof (value) === 'string' ? value : JSON.stringify(value));
  }
  remove(key: string) {
    localStorage.removeItem(key);
  }
  clear() {
    localStorage.clear();
  }
}
const cacheService = new CacheService();

export {
  cacheService,
  CacheKeys
};