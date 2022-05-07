import { useRoute } from "vue-router";
import { Entities } from "../entity";

const useEntityContext = () => {
  const route = useRoute();
  const parentEntityName = route.params?.parentEntityName as string;
  const parentRecordId = route.params?.parentRecordId as string;
  const entityName = route.params?.entityName as string;
  const recordId = route.params?.recordId as string;
  const matched = {
    parentEntityName: Entities.Empty,
    parentRecordId: '', 
    entityName: Entities.Empty,
    recordId: '',
  };
  if (!entityName && !recordId && !!parentEntityName) {
    matched.entityName = parentEntityName as Entities;
    matched.recordId = parentRecordId;
  }else if (!!parentEntityName && !!parentRecordId && !!entityName) {
    matched.parentEntityName = parentEntityName as Entities;
    matched.parentRecordId = parentRecordId;
    matched.entityName = entityName as Entities;
    matched.recordId = recordId;
  }
  
  return {...matched};
};


export { useEntityContext };