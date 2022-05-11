/* eslint-disable no-prototype-builtins */

const enum YNCacheKey {
    User = 'YN:User',
    AccessToken = 'YN:TOKEN',
}

const CacheKeys = [
  YNCacheKey.AccessToken,
  YNCacheKey.User
];

export const enum StorageType {
  Persistent = 'persistent',
  Session = 'session', 
}

function getAppAllCacheValueFromStorage(storage: Storage) {
  return CacheKeys.reduce((acc, key) => {
    const stringValue = storage.getItem(key);
    if (stringValue !== null) {
      const value = JSON.parse(stringValue);
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
}

function removeAppAllCacheFromStorage(storages: Storage[]) {
  storages.forEach(storage => {
    CacheKeys.forEach(key => {
      storage.removeItem(key);
    });
  });
}

class CacheService {
  private _session: {[key: string]: any};
  private _persistent:  {[key: string]: any};
  constructor() {
    this._session = getAppAllCacheValueFromStorage(sessionStorage);
    this._persistent =  getAppAllCacheValueFromStorage(localStorage);
  }
  get(key: string) {
    if (this._session.hasOwnProperty(key)) {
      return this._session[key];
    }
    return this._persistent[key];
  }
  set(key: string, value: any, type: StorageType) {
    if (type === StorageType.Persistent) {
      this._persistent[key] = value;
      localStorage.setItem(key, JSON.stringify(value));
    }else if (type === StorageType.Session) {
      this._session[key] = value;
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  }
  remove(key: string) {
    if (this._persistent.hasOwnProperty(key)) {
      delete this._persistent[key];
      localStorage.removeItem(key);
    }else if (this._session.hasOwnProperty(key)){
      delete this._session[key];
      sessionStorage.removeItem(key);
    }
  }
  clear() {
    this._session = {};
    this._persistent = {};
    localStorage.removeAppAllCacheFromStorage([localStorage, sessionStorage]);
  }
}
const cacheService = new CacheService();

export {
  cacheService,
  YNCacheKey
};