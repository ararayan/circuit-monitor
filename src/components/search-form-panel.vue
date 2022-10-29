<template>
      <ion-menu side="end" :menuId="ionMenuId"  style="--side-max-width: 400px">
        <ion-header mode="md">
          <ion-toolbar color="primary">
            <ion-buttons slot="start" >
              <ion-menu-button :menu="menuId">
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
import { Entities, useEntityRecordsStore } from '@/share/entity';
import { IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonItem, IonList, IonMenu, IonMenuButton, IonTitle, IonToolbar, menuController
} from '@ionic/vue';
import { ref, toRefs } from '@vue/reactivity';
import { closeOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { defineComponent, PropType, watch } from 'vue';
import SearchForm, { SysFormComponent } from './search-form.vue';


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
    menuId: {type: String, required: true }
  },
  setup(props) {
    const formRef = ref<SysFormComponent>(null as never);
    const { menuId: ionMenuId } = toRefs(props);
    const recordStore = useEntityRecordsStore(props.entityName);
    const { records, isInited } = storeToRefs(recordStore);
    watch(records, () => {
      if (records.value.length && isInited.value) {
        menuController.close(ionMenuId.value);
      }
    });

    const submitForm = () => {
      formRef.value?.onSubmit();
    };
    const resetForm = () => {
      formRef.value?.onReset();
    };
    return {
      ionMenuId,
      closeOutline,
      submitForm,
      resetForm,
      formRef,
    };
  },
});
</script>
