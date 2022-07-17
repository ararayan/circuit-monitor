import { Entities } from "./entity.types";

export enum EntityStoreFeature {
  Record = 'record',
  Relation = 'relation',
  EditForm = 'editForm',
  SearchForm = 'searchForm',
  Tab = 'tab',
}

export function getEntityRecordStoreId(entityName: Entities, feature: EntityStoreFeature) {
  return `${entityName}_${feature}`;
}
