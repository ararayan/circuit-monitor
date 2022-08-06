import { Entities } from "./entity.types";

export enum EntityStoreFeature {
  Record = 'record',
  Relation = 'relation',
  EditForm = 'editForm',
  SearchForm = 'searchForm',
  Tab = 'tab',
  PCB = 'pcb',
  PCBStatus = 'pcbStatus',
}

export function getEntityRecordStoreId(entityName: Entities, feature: EntityStoreFeature, recordId?: string) {
  return recordId ? `${entityName}_${recordId}_${feature}` : `${entityName}_${feature}`;
}
