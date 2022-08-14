import { Components } from "@ionic/core";
import { modalController } from "@ionic/vue";
import {  reactive, UnwrapNestedRefs, watch } from "vue";

const cache = {} as Record<string, {
    data: UnwrapNestedRefs<any>,
    modal: any
}>;

function useIonModal(id: string) {
  let modalData: UnwrapNestedRefs<any>;
  if (!cache[id]) {
    cache[id] = {data: reactive({}), modal: null};
    modalData = cache[id].data;
    watch(modalData, () => {
      // debugger;
    });
  }else {
    modalData = cache[id].data;
  }


  const openModal = async (options: Omit<Parameters<typeof modalController.create>[0], 'id'>) => {
    const modal = await modalController
      .create({
        id,
        cssClass: 'auto-height',
        backdropDismiss: true,
        swipeToClose: true,
        ...options,
        componentProps: {
          ...options.componentProps,
          modalId: 'pw_modal_1'
        },
      }) as Components.IonModal;
    await modal.present();
    modal.canDismiss = () => {
      return Promise.resolve(false);
    };
    // debugger;
    const abc =  await modal.onDidDismiss<string>();
    // debugger;
    return abc;
  };

  return {
    openModal,
    modalData
  };
}

export { useIonModal };
