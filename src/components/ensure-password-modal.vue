<template>
<ion-modal class="auto-height"  :backdrop-dismiss = "true" :is-open="isOpen" :can-dismiss="canDismiss">
  <ion-list>
      <password-field :field="password" :form-name="password.id" @update:value="pwValue = $event"></password-field>
  </ion-list>
   <ion-button  @click="$emit('update:password', password)">确认</ion-button>
</ion-modal>
</template>

<script lang="ts">
import PasswordField from '@/controls/password-field.vue';
import { EntityAttrType, FormField } from '@/share/entity';
import { IonButton, IonList, IonModal } from '@ionic/vue';
import { defineComponent, onUnmounted, ref } from 'vue';


export default defineComponent({
  name: 'EnsurePasswordModal',
  components: { IonList, PasswordField, IonButton, IonModal},
  props: {
    isOpen: { type: Boolean, required: true}
  },
  emits: ['update:password'],
  setup() {
    
    const password: FormField = {id: 'password_1', label: '请输入用户密码', name: 'description', type: EntityAttrType.Password, value: '******', readonly: false, disabled: false, };
    const pwValue = ref(password.value as string);
    // const modal =  getOverlay(document, 'ion-modal', props.modalId);
    // dismiss role: 'cancel' or 'backdrop' or 'gesture' or 'handler'
    // modalController.dismiss(pwValue.value, '', props.modalId);
    function canDismiss() {
      return Promise.resolve(true);
    }
    onUnmounted(() => {
      debugger;
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
ion-modal.auto-height {
    --height: auto;
}
ion-modal.auto-height .ion-page {
    position: relative;
    display: block;
    contain: content;
}
ion-modal.auto-height .ion-page .inner-content {
    max-height: 80vh;
    overflow: auto;
}
</style>