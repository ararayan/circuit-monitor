import { take } from "rxjs";
import { ref } from "vue";
import { EntityRecord } from "../entity";
import { userService, useUserStore } from "../user";

const useEnsurePassword = (openRecordFn: (item: EntityRecord) => void) => {
  const userStore = useUserStore();
  const pendingRecord = ref<EntityRecord | null>(null);
  function setPendingOpenRecord(record: EntityRecord) {
    pendingRecord.value = record;
  }
  function openRecordByCheckPassword(password: string) {
    userService.checkPassword(userStore.user.userId, password).pipe(take(1)).subscribe(canAccess => {
      debugger;
      pendingRecord.value && openRecordFn(pendingRecord.value);
    //   if (canAccess && pendingRecord.value) {
    //     openRecordFn(pendingRecord.value);
    //   }
    });
  }
  return {setPendingOpenRecord, openRecordByCheckPassword};
};


export { useEnsurePassword };
