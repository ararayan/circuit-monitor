<template>
  <ion-page class="segments-edit-view">
      <ion-header translucent>
          <ion-toolbar mode="md" color="primary">
            <ion-buttons slot="start">
              <ion-back-button default-href="/home" @click="backto()"></ion-back-button>
            </ion-buttons>
            <ion-title center>{{ title }}</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content fullscreen class="ion-padding">
           <edit-form :entityName="entityName" ref="formRef"></edit-form>
        </ion-content>
        <ion-footer style="padding: 0.4em 1em; display: flex; width: 100%; justify-content: flex-end;" :class="[operator.cssClass]">
          <ion-button  @click="applyForEdit()"  style="min-width: 10em;" :color="operator.color">
            <ion-icon :icon="operator.icon" slot="start"></ion-icon>
            <ion-label>{{operator.value}}</ion-label>
          </ion-button>
        </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import EditForm from '@/components/EditForm.vue';
import { getMatchedEntityInfoByRoute } from '@/share';
import { useUserStore } from '@/share/user';
import { IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonLabel, IonPage, IonTitle, IonToolbar, loadingController, toastController } from '@ionic/vue';
import { computed, ref } from '@vue/reactivity';
import { cloudOutline, discOutline, locateOutline, rocketOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { defineComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'OperationsEditView',
  components: {
    IonPage,IonHeader, IonContent, IonIcon, IonLabel,
    IonButtons, IonBackButton, IonToolbar, IonTitle, IonButton, 
    EditForm, IonFooter
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { entityName } = getMatchedEntityInfoByRoute(route);
    // 遥控执行
    const operator = ref({id: 'apply_for_edit', value: '遥控选择', color: 'success', cssClass: 'bg-contrast-success', icon: locateOutline});
    const userStore = useUserStore();
    const { menus }  = storeToRefs(userStore);
    const title = computed(() => {
      return menus.value.find(item => item.id === entityName)?.name || '';
    });
 
    const backto = () => {
      router.push(`/entity/${entityName}`);
    };
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
    const applyForEdit = () => {
      if (operator.value.id === 'apply_for_edit') {
        presentLoading('申请遥控选择中，请等候...').then(loading => {
          return new Promise((resolve) => {
            setTimeout(() => {
              loading.dismiss();
              resolve(true);
            }, 1500);
          });
        }).then(() => {
          return openToast('申请遥控选择成功.');
        }).then(() => {
          operator.value = {
            id: 'submit',
            value: '遥控执行',
            color: 'danger',
            cssClass: 'bg-contrast-danger',
            icon: rocketOutline,
          };
        });
      }else if (operator.value.id === 'submit') {
        // submite
        presentLoading('遥控执行中，请等候...').then(loading => {
          return new Promise((resolve) => {
            setTimeout(() => {
              loading.dismiss();
              resolve(true);
            }, 1500);
          });
        }).then(() => {
          return openToast('遥控执行成功.');
        }).then(() => {
          operator.value = {
            id: 'apply_for_edit',
            value: '遥控选择',
            color: 'success',
            cssClass: 'bg-contrast-success',
            icon: locateOutline,
          };
        });

      }
    };
    return {entityName, title, backto, operator, applyForEdit, cloudOutline, discOutline, locateOutline};
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