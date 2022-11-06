/* eslint-disable no-prototype-builtins */
import { Preferences } from '@capacitor/preferences';

const enum YNCacheKey {
    User = 'YN:User',
    AccessToken = 'YN:TOKEN',
    BaseUrl = 'YN:BaseUrl',
    IsRPBatteryOptimization = 'YN:IsRP:BatteryOptimization',
    // IsStartBgCheck = 'YN:isStartBgCheck',
    StartBgCheckIndex = 'YN:StartBgCheckIndex',
    JXT = 'YN:JXT',
    DebugCanSaveInBGFetch = 'YN:DebugCanSaveInBGFetch',
}


export const enum StorageType {
  Persistent = 'persistent',
  Session = 'session', 
}

// function getAppAllCacheValueFromStorage(storage: Storage) {
//   return CacheKeys.reduce((acc, key) => {
//     const stringValue = storage.getItem(key);
//     if (stringValue !== null) {
//       const value = JSON.parse(stringValue);
//       acc[key] = value;
//     }
//     return acc;
//   }, {} as Record<string, any>);
// }

// function removeAppAllCacheFromStorage(storages: Storage[]) {
//   storages.forEach(storage => {
//     CacheKeys.forEach(key => {
//       storage.removeItem(key);
//     });
//   });
// }

class CacheService {
  private isInit = false;
  private _session: {[key: string]: any} = Object.create(null);
  private _persistent:  {[key: string]: any} = Object.create(null);
  isLoaded = false;
  async load() {
    if (!this.isInit) {
      const persistent = await Preferences.get({ key: StorageType.Persistent });
      if (persistent.value !== null ){
        this._persistent = JSON.parse(persistent.value);
      }
      const session = await Preferences.get({ key: StorageType.Session });
      if (session.value !== null ){
        this._session = JSON.parse(session.value);
      }
    }
    this.isLoaded = true;
  }
  async save() {
    if (this._persistent) {
      await Preferences.set({
        key: StorageType.Persistent,
        value: JSON.stringify(this._persistent)
      });
    }
    if (this._session) {
      await Preferences.set({
        key: StorageType.Session,
        value: JSON.stringify(this._session)
      });
    }
  }
  get(key: string) {
    return this._session[key] ?? this._persistent[key];
  }
  set(key: string, value: any, type: StorageType) {
    if (type === StorageType.Persistent) {
      this._persistent[key] = value;
      // localStorage.setItem(key, JSON.stringify(value));
    }else if (type === StorageType.Session) {
      this._session[key] = value;
      // sessionStorage.setItem(key, JSON.stringify(value));
    }
  }
  remove(key: string) {
    delete this._persistent[key];
    delete this._session[key];
  }
  clear() {
    this._session = Object.create(null);
    this._persistent =  Object.create(null);
    // localStorage.removeAppAllCacheFromStorage([localStorage, sessionStorage]);
  }
}
const cacheService = new CacheService();
export type ICacheService = InstanceType<typeof CacheService>;
export {
  cacheService,
  YNCacheKey
};
