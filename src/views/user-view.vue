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
                <attr-field :field="field" :formName="entityName"></attr-field>
            </ion-list> 
        </ion-content>
        <ion-footer style="padding: 0.4em 1em; display: flex; width: 100%; justify-content: center;" :class="[operator.cssClass]">
          <ion-button  @click="save()"  style="min-width: 10em;" :color="operator.color">
            <ion-icon :icon="operator.icon" slot="start"></ion-icon>
            <ion-label>{{operator.value}}</ion-label>
          </ion-button>
        </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { EntityAttrType, FormField } from '@/share/entity';
import { IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonList, IonIcon, IonLabel, IonPage, IonTitle, IonToolbar, loadingController, toastController } from '@ionic/vue';
import { ref } from '@vue/reactivity';
import { cloudOutline, discOutline, locateOutline } from 'ionicons/icons';
import { defineComponent } from 'vue';
import AttrField from '@/components/attr-field.vue';

export default defineComponent({
  name: 'UserView',
  components: {
    AttrField,
    IonPage,IonHeader, IonContent, IonIcon, IonLabel, IonList, 
    IonButtons, IonBackButton, IonToolbar, IonTitle, IonButton, 
    IonFooter
  },
  setup() {
    const operator = ref({id: 'apply_for_edit', value: '保存', color: 'success', cssClass: 'bg-contrast-success', icon: locateOutline});

    const entityName = 'user' as any;
    const fields: FormField[] = [
      {id: 'userName', label: '用户名', name: 'factoryName', type: EntityAttrType.Text, value: '陈志杰', readonly: true, disabled: true, },
      {id: 'password', label: '新密码', name: 'description', type: EntityAttrType.Password, value: '******', readonly: false, disabled: false, },
      {id: 'passwordConfirm', label: '确认密码', name: 'location', type: EntityAttrType.Password, value: '******',  readonly: false, disabled: false,  },
    ];

    const presentLoading = async (msg: string) => {
      const loading = await loadingController
        .create({
          cssClass: 'my-custom-class',
          message: msg,
          duration: 20*1000,
        });
        
      await loading.present();
      return loading;
      // loading.dismiss()
    };
    const openToast = async (msg: string) => {
      const toast = await toastController
        .create({
          message: msg,
          duration: 1000,
          color: 'success'
        });
      toast.present();
      return toast.onDidDismiss();
    };
    const save = () => {
      presentLoading('保存中，请等候...').then(loading => {
        return new Promise((resolve) => {
          setTimeout(() => {
            loading.dismiss();
            resolve(true);
          }, 200);
        });
      }).then(() => {
        return openToast('密码修改成功.');
      });
    };
    return {entityName, fields, operator, save, cloudOutline, discOutline, locateOutline};
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