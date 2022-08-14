import { useRoute } from "vue-router";
import { Entities } from "../entity";

const useEntityContext = () => {
  const route = useRoute();
  const parentEntityName = route.params?.parentEntityName as string;
  const parentRecordId = route.params?.parentRecordId as string;
  const entityName = route.params?.entityName as string;
  const recordId = route.params?.recordId as string;
  const skipSelfEntity = route.query.skipSelfEntity as string;


  const matched = {
    parentEntityName: Entities.Empty,
    parentRecordId: '', 
    entityName: Entities.Empty,
    recordId: '',
    skipSelfEntity: false,
    backToHref: '/home',
  };
  if (!entityName && !recordId && !!parentEntityName) {
    matched.entityName = parentEntityName as Entities;
    matched.recordId = parentRecordId;
    matched.backToHref = `/entity/${matched.entityName}`;
  }else if (!!parentEntityName && !!parentRecordId && !!entityName) {
    matched.parentEntityName = parentEntityName as Entities;
    matched.parentRecordId = parentRecordId;
    matched.entityName = entityName as Entities;
    matched.recordId = recordId;
    matched.skipSelfEntity = skipSelfEntity === '1';
  }
  
  if (!!parentEntityName && !!parentRecordId && matched.skipSelfEntity) {
    matched.backToHref = `/entity/${matched.parentEntityName}/${matched.parentRecordId}`;
  }

  return {...matched};
};


export { useEntityContext };
