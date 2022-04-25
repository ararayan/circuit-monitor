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
    [EntityViewType.Browse]: 'NotFoundView',
    [EntityViewType.Edit]: 'NotFoundView',
  },
  [Entities.Wirings]: {
    [EntityViewType.Browse]: 'WiringsView',
    [EntityViewType.Edit]: 'SegmentsEditView',
  },
  [Entities.Segments]: {
    [EntityViewType.Browse]: 'SegmentsView',
    [EntityViewType.Edit]: 'SegmentsEditView',
  },
  [Entities.SegmentsChild]: {
    [EntityViewType.Browse]: 'SegmentsChildView',
    [EntityViewType.Edit]: 'SegmentsChildEditView',
  },
  [Entities.Realtime]: {
    [EntityViewType.Browse]: 'RealtimeView',
    [EntityViewType.Edit]: '',
  },
  [Entities.Operations]: {
    [EntityViewType.Browse]: 'OperationsView',
    [EntityViewType.Edit]: 'OperationsEditView',
  },
  [Entities.LightingControl]: {
    [EntityViewType.Browse]: 'LightingControlView',
    [EntityViewType.Edit]: '',
  },
  [Entities.Events]: {
    [EntityViewType.Browse]: 'EventsView',
    [EntityViewType.Edit]: '',
  },
};

export function getViewNameByEntityName(entityName: string, type: EntityViewType) {
  return EntityViewMapping[entityName as Entities]?.[type];
}