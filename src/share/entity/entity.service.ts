import { Entities, FormField } from "./entity.types";
import { of } from "rxjs";
import { events, lightingControl, operations, realtime, segments, segmentsChild, wirings } from "./data";


export function getSearchForm$(entityName: Entities) {
  let result: FormField[] = [];
  switch(entityName) {
  case Entities.Events:
    result = events.searchForm;
    break;
  case Entities.Realtime:
    result = realtime.searchForm;
    break;
  case Entities.Segments:
    result = segments.searchForm;
    break;
  case Entities.SegmentsChild:
    result = segmentsChild.searchForm;
    break;
  case Entities.Operations:
    result = operations.searchForm;
    break;
  case Entities.Wirings:
    result = wirings.searchForm;
    break;
  case Entities.LightingControl:
    result = lightingControl.searchForm;
    break;
  default:
    break;
  }
  return of(result);
}
export function getEditForm$(entityName: Entities) {
  let result: FormField[] = [];
  switch(entityName) {
  case Entities.Operations:
    result = operations.editForm;
    break;
  default:
    break;
  }
  return of(result);
}