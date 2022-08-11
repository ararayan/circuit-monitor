<template>
  <ion-page class="segments-edit-view">
    <ion-header translucent>
      <ion-toolbar mode="md" color="primary">
        <ion-buttons slot="start">
          <ion-back-button :default-href="backToHref"></ion-back-button>
        </ion-buttons>
        <ion-title center>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen class="ion-padding">
      <edit-form :entityName="entityName" ref="formRef" :record-id="recordId" :form-fields="fields"></edit-form>
    </ion-content>
    <ion-footer style="padding: 0.4em 1em; display: flex; width: 100%; justify-content: flex-end;"
      :class="[operator.cssClass]">
      <ion-button @click="applyForEdit()" style="min-width: 10em;" :color="operator.color">
        <ion-icon :icon="operator.icon" slot="start"></ion-icon>
        <ion-label>{{ operator.value }}</ion-label>
      </ion-button>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import EditForm from '@/components/edit-form.vue';
import { OperatorType, useEntityContext, useEntityDisplayName, useEntityEditFormStore } from '@/share';
import { useUserStore } from '@/share/user';
import { IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonLabel, IonPage, IonTitle, IonToolbar, toastController, useBackButton, useIonRouter } from '@ionic/vue';
import { computed } from '@vue/reactivity';
import { cloudOutline, discOutline, locateOutline, rocketOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { defineComponent, onMounted, onUnmounted, watch } from 'vue';

const operators = {
  [OperatorType.RemoteSelect]: { id: OperatorType.RemoteSelect, value: '遥控选择', color: 'success', cssClass: 'bg-contrast-success', icon: locateOutline, },
  [OperatorType.RemoteExcute]: { id: OperatorType.RemoteExcute, value: '遥控执行', color: 'danger', cssClass: 'bg-contrast-danger', icon: rocketOutline, },
};
const openToast = async (msg: string) => {
  const toast = await toastController
    .create({
      message: msg,
      duration: 1000,
      color: 'success'
    });
  toast.present();
  return toast;
};

const YxActionFieldId = 'zhaStatus';

export default defineComponent({
  name: 'OperationsEditView',
  components: {
    IonPage, IonHeader, IonContent, IonIcon, IonLabel,
    IonButtons, IonBackButton, IonToolbar, IonTitle, IonButton,
    EditForm, IonFooter
  },
  setup() {
    const router = useIonRouter();
    const { backToHref, entityName, recordId } = useEntityContext();
    const { title } = useEntityDisplayName(entityName);
    debugger;
    const entityEditFormStore = useEntityEditFormStore(entityName, recordId);
    const { editForm: fields, operatorId, operatorMsg } = storeToRefs(entityEditFormStore);


 
    const operator = computed(() => {
      return operators[operatorId.value];
    });
    onMounted(() => {
      watch(operatorMsg, (next, prev) => {
        if (next !== prev && !!next) {
          openToast(next);
        }
      }, { immediate: true });
    });

    const applyForEdit = () => {
      if (operator.value.id === OperatorType.RemoteSelect) {
        const { kfId, khId, } = entityEditFormStore.currRecordInfo;
        const yxIds = entityEditFormStore.recordId;
        const action = entityEditFormStore.editForm.find(x => x.id === YxActionFieldId)?.value as string | '';
        if (action && yxIds && kfId && khId) {
          entityEditFormStore.requestSelect({ yxIds, kfId, khId, action });
        }
      } else if (operator.value.id === OperatorType.RemoteExcute) {
        const { kfId, khId, } = entityEditFormStore.currRecordInfo;
        const yxIds = entityEditFormStore.recordId;
        const action = entityEditFormStore.editForm.find(x => x.id === YxActionFieldId)?.value as string | '';
        if (action && yxIds && kfId && khId) {
          entityEditFormStore.requestExcute({ yxIds, kfId, khId, action });
        }
      }

    };

    const result = useBackButton(10, () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push(backToHref);
      }
    });
    
    onUnmounted(() => {
      result.unregister();
      entityEditFormStore.destroy();
    });

    entityEditFormStore.getEditForm();
    return { entityName, recordId, title, backToHref, operator, applyForEdit, fields, cloudOutline, discOutline, locateOutline };
  }
});
</script>
<style>
.bg-contrast-danger {
  background-color: var(--ion-color-secondary-contrast, #fff);
}

.bg-contrast-success {
  background-color: var(--ion-color-success-contrast, #fff);
}
</style>
