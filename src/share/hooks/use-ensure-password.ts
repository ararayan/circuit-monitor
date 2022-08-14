import { ref } from "vue";
import { authService } from "../auth";
import { EntityRecord } from "../entity";

const useEnsurePassword = () => {
  const pendingRecord = ref<EntityRecord | null>(null);

  function setPendingOpenRecord(record: EntityRecord) {
    pendingRecord.value = record;
  }
  
  function openRecordByCheckPassword(password: string) {
    return authService.checkPassword(password);
  }
  return {setPendingOpenRecord, openRecordByCheckPassword};
};


export { useEnsurePassword };
