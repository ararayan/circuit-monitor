import { defineStore } from "pinia";
import { Subject, BehaviorSubject } from "rxjs";
import { Entities, OperatorType } from "../entity";
import { filter, takeUntil } from 'rxjs/operators';

export interface OperatorCheckListItem {
  /**
   * general format with: entity + operatorType
   */
  id: string;
  entity: Entities;
  operatorType: OperatorType;
  /**
   * operator check params
   */
  playload: any;
  /**
   * general was operator list item record info
   */
  context: any;
  result: any;
  start: boolean;
  finish: boolean;
  error: boolean;
}

export interface OperatorCheckListItemSubjectParams {
  action: 'add' | 'remove';
  item: OperatorCheckListItem;
}

const destory$ = new Subject<boolean>();
const startCheckItem$ = new BehaviorSubject<OperatorCheckListItemSubjectParams | null>(null);
const endCheckItem$ = new BehaviorSubject<OperatorCheckListItemSubjectParams | null>(null);
// start check list subscribe

startCheckItem$.pipe(
  filter(x => !!x),
  takeUntil(destory$)
).subscribe();


export function useCheckOperatorStore() {
  return defineStore('OperatorCheckList', {
    state: () => {
      const initialState = {
        checkList: [] as OperatorCheckListItem[],
      };
      destory$?.next(true);
      // checkListItem$?.complete();
      return { ...initialState };
    },
    actions: {
      addCheckItem(item: OperatorCheckListItem) {
        if (!this.checkList.find(curr => curr.id === item.id)) {
          this.$patch({
            checkList: [...this.checkList, item]
          });
          startCheckItem$.next({action: 'add', item: JSON.parse(JSON.stringify(item))});
        }
      },
      removeCheckItem(itemId: string) {
        const toRemoveItem = this.checkList.find(curr => curr.id === itemId);
        if (toRemoveItem) {
          this.$patch({
            checkList: this.checkList.filter(curr => curr.id === itemId)
          });
          endCheckItem$.next({action: 'remove', item: JSON.parse(JSON.stringify(toRemoveItem))});
        }
      },
      clearCheckList() {
        if (this.checkList.length) {
          this.checkList.forEach(item => {
            endCheckItem$.next({action: 'remove', item: JSON.parse(JSON.stringify(item))});
          });
          this.$patch({
            checkList: []
          });
        }
      },
      destroy() {
        // fix: pinia.state will cache state even the store instance was remove by call self dispose;
        // manual call reset make cahce state backto inital status; more detail see the state fn on below;
        this.$reset();
        startCheckItem$.complete();
        endCheckItem$.complete();
        destory$.complete();
        this.$dispose();
      },
    }
  })();
}
