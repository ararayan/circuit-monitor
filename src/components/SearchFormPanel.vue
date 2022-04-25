<template>
      <ion-menu side="end" :menuId="menuId">
        <ion-header mode="md" collapse="fade">
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-menu-button autoHide="false">
                <ion-icon :icon="arrowBackOutline"></ion-icon>
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

  IonFooter, IonHeader, IonIcon, IonItem, IonList, IonMenu, IonMenuButton, IonTitle, IonToolbar } from '@ionic/vue';
import { ref } from '@vue/reactivity';
import { arrowBackOutline } from 'ionicons/icons';
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
    const submitForm = () => {
      formRef.value?.onSubmit();
      menuController.close(menuId);
    };
    const resetForm = () => {
      formRef.value?.onReset();
    };
    return {
      menuId,
      arrowBackOutline,
      submitForm,
      resetForm,
      formRef,
    };
  },
});
</script>
