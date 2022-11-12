
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

export type EntityRecordAlias<T extends Record<string, any> = any>  = {
  [P in keyof T]: T[P];
} & { 
  id: string | number;
};


export interface FormField{
  id: string;
  label: string;
  name: string;
  type: EntityAttrType; 
  value: string | number | boolean;
  originValue: string | number | boolean;
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
