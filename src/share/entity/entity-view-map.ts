export const enum Entities {
    Wirings = 'wirings',
    Segments = 'segments',
    Telesignalling = 'telesignalling',
    Telemetry = 'telemetry',
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
  [Entities.Telesignalling]: {
    [EntityViewType.Browse]: 'SegmentsView',
    [EntityViewType.Edit]: 'SegmentsEditView',
  },
  [Entities.Telemetry]: {
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