export const enum DataStatus {
    Unloaded= 'unloaded',
    Loading = 'loading',
    Loaded = 'loaded',
    Error = 'error',
}
export const enum DataFrom {
    LocalCache = 'local_cache',
    Server = 'server',
    Memoery = 'memoery',
}
export enum RecordDataMetaType {
    From = 'from',
    Status = 'status',
}

export function getStateMetaKey(key: string, metaType: RecordDataMetaType = RecordDataMetaType.Status) {
  return `[meta]:${key}_${metaType}`;
}