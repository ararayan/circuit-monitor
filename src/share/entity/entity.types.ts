import { DataStatus } from "../data.meta";

export const enum EntityAttrType {
    Text = 'text',
    Password = 'password',
    Numeric = 'numeric',
    Textarea = 'textarea',
    Select = 'select',
    Checkbox = 'tcheckboxext',
    Radio = 'radio',
    RadioGroup = 'radioGroup',
    DateTime = 'dateTime',
    Date = 'date',
    Time = 'time',
    Tel = 'tel',
    Url = 'url',
  }

export interface EntityRecord {
    id: string | number;
    avatar?: string;
    displayName?: string;
    colA?:  string;
    colB?:  string;
    [key: string]: any;
}
export interface FormField{
  id: string;
  label: string;
  name: string;
  type: EntityAttrType; 
  value: string | number | boolean;
  readonly: boolean;
  disabled: boolean;
  persistent: boolean,
  options?: Record<string, string>[];
  rules?: any;
  layout?: {
    fieldLines?: 'full' | 'inset' | 'none';
    labelPosition?: 'stacked' | 'fixed' | 'floating';
    isHideLabel?: boolean;
  }
}
export interface EntityTabInfo {
  colName: string;
  id: string;
  value: string;
  displayName: string;
  selected: boolean;
}

// export enum EntityTrackDataType {
//   Records = 'records',
//   SearchForm = 'searchForm',
//   EditForm = 'editForm',
//   EntityTabs = 'entityTabs',
// }
// export interface EntityTrackData extends Partial<Record<EntityTrackDataType, unknown>>{
//   records: EntityRecord[],
//   searchForm: FormField[],
//   editForm?: FormField[],
//   entityTabs?: EntityTabInfo[],
//   meta: Partial<Record<EntityTrackDataType, DataStatus>>
// }
export interface abc {
  editForm: FormField[],
  entityTabs: EntityTabInfo[],
  meta: {
    editForm: DataStatus,
    entityTabs: DataStatus,
  }
}


export type EntityBaseTrackData<T = object> = {
  entityName: string;
  editViewEntityName: Entities;
  pagination: {current: number; pageSize: number; total: number;},
  records: EntityRecord[],
  searchForm: FormField[],
  editForm: FormField[],
  meta: {
    records: DataStatus,
    searchForm: DataStatus,
    editForm: DataStatus,
  }
} & { [P in keyof T]: T[P] };

export type EntityState = EntityBaseTrackData<abc>;


export const enum Entities {
    Empty = 'empty',
    Wirings = 'wirings',
    Segments = 'segments',
    SegmentsChild = 'segmentsChild',
    Realtime = 'realtime',
    Operations = 'operations',
    LightingControl = 'lightcontrol',
    // Telesignalling = 'telesignalling',
    // Telemetry = 'telemetry',
    Events = 'events',
}
export const enum EntityViewType {
  Browse = 'browse',
  Detail = 'detail',
}
export type EntityViews  =  Record<Entities,{ [EntityViewType.Browse]: string, [EntityViewType.Detail]: string }>;
