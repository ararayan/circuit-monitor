export const enum Entities {
    Wirings = 'wirings',
    Segments = 'segments',
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
  [Entities.Wirings]: {
    [EntityViewType.Browse]: 'SegmentsView',
    [EntityViewType.Edit]: 'SegmentsEditView',
  },
  [Entities.Segments]: {
    [EntityViewType.Browse]: 'SegmentsView',
    [EntityViewType.Edit]: 'SegmentsEditView',
  },
  [Entities.Realtime]: {
    [EntityViewType.Browse]: 'SegmentsView',
    [EntityViewType.Edit]: 'SegmentsEditView',
  },
  [Entities.Operations]: {
    [EntityViewType.Browse]: 'SegmentsView',
    [EntityViewType.Edit]: 'SegmentsEditView',
  },
  [Entities.LightingControl]: {
    [EntityViewType.Browse]: 'SegmentsView',
    [EntityViewType.Edit]: 'SegmentsEditView',
  },
  [Entities.Events]: {
    [EntityViewType.Browse]: 'SegmentsView',
    [EntityViewType.Edit]: 'SegmentsEditView',
  },
};

export function getViewNameByEntityName(entityName: string, type: EntityViewType) {
  return EntityViewMapping[entityName as Entities]?.[type];
}