import { RouteRecordRaw } from "vue-router";


export const enum Entities {
    Wirings = 'wirings',
    Segments = 'segments',
    Telesignalling = 'telesignalling',
    Telemetry = 'telemetry',
    Events = 'events',
}


type CustomRouteInfo =  { 
  featureName: string;
  viewName: string;
  path: string;
  children?: Array<CustomRouteInfo & Partial<RouteRecordRaw>>
}

export type EntityRecordMap  =  Record<Entities, Array<CustomRouteInfo>>;

export const EntityRoutes: EntityRecordMap = {
  [Entities.Wirings]: [{
    featureName: 'wirings',
    viewName: 'WiringsView',
    path: '/wirings',
  }],
  [Entities.Segments]: [{
    featureName: 'segments',
    viewName: 'segments-view',
    path: '/segments',
    children: [
      {
        featureName: 'segments',
        viewName: 'segments-edit-view',
        path: '/segments/:id',
      }
    ]
  },],
  [Entities.Telesignalling]: [{
    featureName: 'telesignalling',
    viewName: 'telesignalling-view',
    path: '/telesignalling',
  }],
  [Entities.Telemetry]: [{
    path: '/telemetry',
    featureName: 'telemetry',
    viewName: 'telemetry-view',
  }],
  [Entities.Events]: [{
    path: '/events',
    featureName: 'events',
    viewName: 'events-view',
  }],
};