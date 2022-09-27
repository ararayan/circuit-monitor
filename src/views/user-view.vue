<template>
  <ion-page class="segments-edit-view">
      <ion-header translucent>
          <ion-toolbar mode="md" color="primary">
            <ion-buttons slot="start">
              <ion-back-button default-href="/home"></ion-back-button>
            </ion-buttons>
            <ion-title center>修改密码</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content fullscreen class="ion-padding">
            <ion-list v-for="field in fields" :key="field.id">
                <attr-field :field="field" :formName="entityName" @update:value="updateValue()"></attr-field>
            </ion-list> 
        </ion-content>
        <ion-footer style="padding: 0.4em 1em;display: flex;width: 100%;justify-content: flex-end; align-items: center;" :class="[operator.cssClass]">
          <ion-label color="danger" class="ion-padding-end" :class="{'ion-hide': !!!updatePasswordResultMsg}">{{updatePasswordResultMsg}}</ion-label>
          <ion-button  @click="save()"  style="min-width: 10em;" :color="operator.color">
            <ion-icon :icon="operator.icon" slot="start"></ion-icon>
            <ion-label>{{operator.value}}</ion-label>
          </ion-button>
        </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import AttrField from '@/components/attr-field.vue';
import { UpdatePasswordInfo } from '@/share/auth/auth.service';
import { EntityAttrType, FormField } from '@/share/entity';
import { useUserStore } from '@/share/user';
import { IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { ref } from '@vue/reactivity';
import { cloudOutline, discOutline, locateOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { defineComponent } from 'vue';


export default defineComponent({
  name: 'UserView',
  components: {
    AttrField,
    IonPage,IonHeader, IonContent, IonIcon, IonLabel, IonList, 
    IonButtons, IonBackButton, IonToolbar, IonTitle, IonButton, 
    IonFooter
  },
  setup() {
    const operator = ref({id: 'save', value: '保存', color: 'success', cssClass: 'bg-contrast-success', icon: locateOutline});
    const userStore = useUserStore();
    const { user, updatePasswordError, updatePasswordResultMsg } = storeToRefs(userStore);
    const entityName = 'user' as any;

    const fields: FormField[] = [
      {id: 'userName', label: '用户名', name: 'userName', type: EntityAttrType.Text, value: user.value.userName, originValue: user.value.userName,  readonly: true, disabled: true, persistent: true },
      {id: 'oldPwd', label: '旧密码', name: 'oldPwd', type: EntityAttrType.Password, value: '', originValue: '', readonly: false, disabled: false, persistent: true },
      {id: 'newPwd', label: '新密码', name: 'newPwd', type: EntityAttrType.Password, value: '', originValue: '', readonly: false, disabled: false, persistent: true },
      {id: 'newPwd2', label: '确认密码', name: 'newPwd2', type: EntityAttrType.Password, value: '', originValue: '', readonly: false, disabled: false, persistent: true  },
    ];


    userStore.resetUpdatePwdValidation();

    const updateValue = () => {
      userStore.resetUpdatePwdValidation();
    };
    
    const save = () => {
      const updateInfo = fields.reduce((acc, item) => {
        if (item.id !== 'userName') {
          acc[item.id as keyof UpdatePasswordInfo] = item.value as string;
        }
        return acc;
      }, {} as UpdatePasswordInfo);
      userStore.updatePassword(updateInfo);
    };
    return {entityName, fields, operator, save, cloudOutline, discOutline, locateOutline, updatePasswordError, updatePasswordResultMsg, updateValue};
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
