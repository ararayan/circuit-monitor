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
  Edit = 'edit',
}
export type EntityViews  =  Record<Entities,{ [EntityViewType.Browse]: string, [EntityViewType.Edit]: string }>;

export const EntityViewMapping: EntityViews = {
  [Entities.Empty]: {
    [EntityViewType.Browse]: 'not-found-view',
    [EntityViewType.Edit]: 'not-found-view',
  },
  [Entities.Wirings]: {
    [EntityViewType.Browse]: 'wirings-view',
    [EntityViewType.Edit]: 'wirings-edit-view',
  },
  [Entities.Segments]: {
    [EntityViewType.Browse]: 'segments-view',
    [EntityViewType.Edit]: 'segments-view',
  },
  [Entities.SegmentsChild]: {
    [EntityViewType.Browse]: 'segments-child-view',
    [EntityViewType.Edit]: 'segments-child-view',
  },
  [Entities.Realtime]: {
    [EntityViewType.Browse]: 'realtime-view',
    [EntityViewType.Edit]: 'realtime-view',
  },
  [Entities.Operations]: {
    [EntityViewType.Browse]: 'operations-view',
    [EntityViewType.Edit]: 'operations-edit-view',
  },
  [Entities.LightingControl]: {
    [EntityViewType.Browse]: 'lighting-control-view',
    [EntityViewType.Edit]: 'lighting-control-view',
  },
  [Entities.Events]: {
    [EntityViewType.Browse]: 'events-view',
    [EntityViewType.Edit]: 'events-view',
  },
};

export function getViewNameByEntityName(entityName: string, type: EntityViewType) {
  return EntityViewMapping[entityName as Entities]?.[type];
}

