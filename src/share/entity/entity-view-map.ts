import { Entities, EntityViews, EntityViewType } from "./entity.types";

export const EntityViewMapping: EntityViews = {
  [Entities.Empty]: {
    [EntityViewType.Browse]: 'not-found-view',
    [EntityViewType.Detail]: 'not-found-view',
  },
  [Entities.Wirings]: {
    [EntityViewType.Browse]: 'wirings-view',
    [EntityViewType.Detail]: 'wirings-edit-view',
  },
  [Entities.Segments]: {
    [EntityViewType.Browse]: 'segments-view',
    [EntityViewType.Detail]: 'segments-view',
  },
  [Entities.SegmentsChild]: {
    [EntityViewType.Browse]: 'segments-child-view',
    [EntityViewType.Detail]: 'segments-child-view',
  },
  [Entities.Realtime]: {
    [EntityViewType.Browse]: 'realtime-view',
    [EntityViewType.Detail]: 'realtime-view',
  },
  [Entities.Operations]: {
    [EntityViewType.Browse]: 'operations-view',
    [EntityViewType.Detail]: 'operations-edit-view',
  },
  [Entities.LightingControl]: {
    [EntityViewType.Browse]: 'lighting-control-view',
    [EntityViewType.Detail]: 'lighting-control-view',
  },
  [Entities.Events]: {
    [EntityViewType.Browse]: 'events-view',
    [EntityViewType.Detail]: 'events-view',
  },
};

export function getViewNameByEntityName(entityName: string, type: EntityViewType) {
  return EntityViewMapping[entityName as Entities]?.[type];
}

