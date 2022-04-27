<template>
      <ion-menu side="end" :menuId="menuId"  style="--side-max-width: 400px">
        <ion-header mode="md" collapse="fade">
          <ion-toolbar color="primary">
            <ion-buttons slot="start" >
              <ion-menu-button autoHide="false">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-menu-button>
            </ion-buttons>
            <ion-title center>过滤</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <search-form :entityName="entityName" ref="formRef"></search-form>
        </ion-content>
        <ion-footer>
          <ion-list style="display: flex; justify-content: space-between;">
            <ion-item lines="none" style="flex: 1 1 50%;">
              <ion-button style="width: 100%; height: 100%;" type="submit" size="large" fill="clear" @click="resetForm()">重置</ion-button>
            </ion-item>
            <ion-item lines="none" style="flex: 1 1 50%;">
                <ion-button type="submit"  style="width: 100%; height: 100%;"  fill="clear" size="large" @click="submitForm()">搜索</ion-button>
            </ion-item>
          </ion-list>
        </ion-footer>
      </ion-menu>
</template>

<script lang="ts">
import { Entities } from '@/share/entity';
import { IonButton, IonButtons, IonContent,

  IonFooter, IonHeader, IonIcon, IonItem, IonList, IonMenu, IonMenuButton, IonTitle, IonToolbar, loadingController, toastController   } from '@ionic/vue';
import { ref } from '@vue/reactivity';
import { closeOutline } from 'ionicons/icons';
import { defineComponent, PropType } from 'vue';
import SearchForm, { SysFormComponent } from './SearchForm.vue';
import { menuController } from "@ionic/vue";


export default defineComponent({
  name: 'SearchFormPanel',
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonContent,
    IonFooter,
    IonButton,
    IonButtons,
    IonMenu,
    IonMenuButton,
    IonIcon,
    SearchForm,
  },
  props: {
    entityName: {type: String as PropType<Entities>, required: true},
  },
  setup(props) {
    const formRef = ref<SysFormComponent>(null as never);
    const menuId = `${props.entityName}_search_form_sidebar_${Math.random() * 1000}`;
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
    const submitForm = () => {
      formRef.value?.onSubmit();
      menuController.close(menuId);
      presentLoading('searching...').then(loading => {
        return new Promise((resolve) => {
          setTimeout(() => {
            loading.dismiss();
            resolve(true);
          }, 1000);
        });
      }).then(() => {
        return openToast('success');
      });
    };
    const resetForm = () => {
      formRef.value?.onReset();
      presentLoading('reset...').then(loading => {
        return new Promise((resolve) => {
          setTimeout(() => {
            loading.dismiss();
            resolve(true);
          }, 1000);
        });
      }).then(() => {
        return openToast('success');
      });
    };
    return {
      menuId,
      closeOutline,
      submitForm,
      resetForm,
      formRef,
    };
  },
});
</script>
