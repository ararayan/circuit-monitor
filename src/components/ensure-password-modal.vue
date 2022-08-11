<template>
  <ion-modal class="pw-modal" :backdrop-dismiss="true" :is-open="isOpen" :can-dismiss="canDismiss"
    @willDismiss="$emit('cancel')">
    <ion-Item lines="none">
      <ion-text class="ion-text-strong">{{ password.label }}</ion-text> 
            <ion-text> {{invalid ? '(密码错误)' : ''}}</ion-text> 
     
    </ion-Item>
    <ion-list class="ion-margin-start ion-margin-end"  style="padding-top: 0; padding-bottom: 0;" >
      <password-field :field="password" :form-name="password.id" @update:value="pwValue = $event, $emit('change')"></password-field>
    </ion-list>
    <ion-grid style="--ion-grid-padding: 16px;" >
      <ion-row>
        <ion-col>
          <ion-button @click="$emit('cancel')" expand="block" color="light">取消</ion-button>
        </ion-col>
        <ion-col>
          <ion-button @click="$emit('ok', password)" expand="block" color="success">确认</ion-button>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-modal>
</template>

<script lang="ts">
import PasswordField from '@/controls/password-field.vue';
import { EntityAttrType, FormField } from '@/share/entity';
import { IonButton, IonList, IonModal, IonItem, IonGrid, IonRow, IonCol, IonText } from '@ionic/vue';
import { defineComponent, onUnmounted, ref, toRefs, watch } from 'vue';


export default defineComponent({
  name: 'EnsurePasswordModal',
  components: { IonList, PasswordField, IonButton, IonModal, IonItem, IonGrid, IonRow, IonCol, IonText },
  props: {
    isOpen: { type: Boolean, required: true },
    invalid: { type: Boolean, required: true }
  },
  emits: ['ok', 'cancel', 'change'],
  setup(props) {
    const { isOpen } = toRefs(props);

    const password: FormField = {
      layout: { isHideLabel: true },
      id: 'password_1', label: '请输入用户密码', name: 'description', type: EntityAttrType.Password, value: '', readonly: false, disabled: false, persistent: true 
    };
    const pwValue = ref(password.value as string);
    // const modal =  getOverlay(document, 'ion-modal', props.modalId);
    // dismiss role: 'cancel' or 'backdrop' or 'gesture' or 'handler'
    // modalController.dismiss(pwValue.value, '', props.modalId);
    function canDismiss() {
      return Promise.resolve(true);
    }
    watch(isOpen, () => {
      password.value = '';
    });
    onUnmounted(() => {
      // debugger;
    });
    return {
      pwValue,
      password,
      canDismiss,
    };
  }
});
</script>


<style>
ion-modal.pw-modal {
  --height: auto;
  --width: 85vw;
}

ion-modal.pw-modal .ion-page {
  position: relative;
  display: block;
  contain: content;
}

ion-modal.pw-modal .ion-page .inner-content {
  max-height: 80vh;
  max-width: 80vw;
  overflow: auto;
}
</style>
