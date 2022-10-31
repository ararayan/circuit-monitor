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
      <edit-form v-if="fields.length" :entityName="entityName" ref="formRef" :record-id="recordId" :form-fields="fields"></edit-form>
      <div v-else style="height: 100%; display: flex; justify-content: center; align-items: center; flex-direction: column;">
        <ion-label size="l" color="medium">未能加载表单, 网络或者服务器出错！</ion-label>
        <ion-label size="l" color="medium">请稍候请试，或者联系管理人员。</ion-label>
      </div>

    </ion-content>
    <ion-footer style="padding: 0.4em 1em; display: flex; width: 100%; justify-content: flex-end;"
      :class="[operator.cssClass]">
      <ion-button @click="applyForEdit()" style="min-width: 10em;" :color="operator.color"
        :disabled="operator.disabled">
        <ion-spinner name="lines-sharp-small" v-if="operator.showSpinner"></ion-spinner>
        <ion-icon :icon="operator.icon" slot="start" v-if="!operator.showSpinner"></ion-icon>
        <ion-label>{{ operator.value }}</ion-label>
      </ion-button>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import EditForm from '@/components/edit-form.vue';
import { OperatorStatus, OperatorType, useEntityContext, useEntityDisplayName, useEntityEditFormStore } from '@/share';
import { ControlStatusCode } from '@/share/entity/data/operations';
import { IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonSpinner, IonLabel, IonPage, IonTitle, IonToolbar, toastController, useBackButton, useIonRouter } from '@ionic/vue';
import { computed } from '@vue/reactivity';
import { cloudOutline, discOutline, locateOutline, rocketOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { defineComponent, onMounted, onUnmounted, watch } from 'vue';

const operators = {
  [OperatorType.RemoteSelect]: { id: OperatorType.RemoteSelect, value: '遥控选择', color: 'success', cssClass: 'bg-contrast-success', icon: locateOutline, disabled: false, showSpinner: false },
  [OperatorType.RemoteExcute]: { id: OperatorType.RemoteExcute, value: '遥控执行', color: 'danger', cssClass: 'bg-contrast-danger', icon: rocketOutline, disabled: false, showSpinner: false },
};
const openToast = async (msg: string, color: string) => {
  const toast = await toastController
    .create({
      message: msg,
      duration: 2000,
      color: color
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
    EditForm, IonFooter,IonSpinner,
  },
  setup() {
    const router = useIonRouter();
    const { backToHref, entityName, recordId } = useEntityContext();
    const { title } = useEntityDisplayName(entityName);

    const entityEditFormStore = useEntityEditFormStore(entityName, recordId);
    const { editForm: fields, operatorId, operatorMsg, operatorStatus, isInited } = storeToRefs(entityEditFormStore);

    const operator = computed(() => {
      const action = entityEditFormStore.editForm.find(x => x.id === YxActionFieldId)?.value as ControlStatusCode;
      const isvalidAction = [ControlStatusCode.Fen, ControlStatusCode.He].includes(action);
      const op = {...operators[operatorId.value]};
      if (operatorStatus.value === OperatorStatus.RemoteSelect) {
        op.value = '正在遥控选择...';
      } else if (operatorStatus.value === OperatorStatus.RemoteExcute) {
        op.value = '正在遥控执行..';
      }
      op.showSpinner = operatorStatus.value !==  OperatorStatus.Empty;
      op.disabled = op.showSpinner || !isvalidAction;
      return op;
    });

    onMounted(() => {
      if (!entityEditFormStore.currRecordInfo.kfId || !entityEditFormStore.currRecordInfo.khId) {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace(backToHref);
        }
      }
      watch(operatorMsg, (next, prev) => {
        if (next !== prev && !!next) {
          openToast(next, 'warning');
        }
      }, { immediate: true });
    });

    const applyForEdit = () => {
      if (operator.value.id === OperatorType.RemoteSelect) {
        const { kfId, khId, } = entityEditFormStore.currRecordInfo;
        const yxIds = entityEditFormStore.recordId;
        const action = entityEditFormStore.editForm.find(x => x.id === YxActionFieldId)?.value as ControlStatusCode;
        const isvalidAction = [ControlStatusCode.Fen, ControlStatusCode.He].includes(action);
        if (isvalidAction && action && yxIds && kfId && khId) {
          entityEditFormStore.requestSelect({ yxIds, kfId, khId, action });
        }
      } else if (operator.value.id === OperatorType.RemoteExcute) {
        const { kfId, khId, } = entityEditFormStore.currRecordInfo;
        const yxIds = entityEditFormStore.recordId;
        const action = entityEditFormStore.editForm.find(x => x.id === YxActionFieldId)?.value as ControlStatusCode;
        const isvalidAction = [ControlStatusCode.Fen, ControlStatusCode.He].includes(action);
        if (isvalidAction && action && yxIds && kfId && khId) {
          entityEditFormStore.requestExcute({ yxIds, kfId, khId, action });
        }
      }

    };

    const disposeFormWatch = watch(fields, () => {
      if (fields.value.length && isInited) {
        entityEditFormStore.syncFields = ['status'];
        entityEditFormStore.startCheckForm();
        disposeFormWatch();
      }
    });

    const result = useBackButton(10, () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push(backToHref);
      }
    });

    onUnmounted(() => {
      disposeFormWatch?.();
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
.operator-status-text {
  flex: 1 1 auto;
  min-width: 0%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 1.5em;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
