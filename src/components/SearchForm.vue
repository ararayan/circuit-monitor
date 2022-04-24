<template>
      <ion-menu side="end" >
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
          <ion-list v-for="field in searchForm"  :key="field.id">
            <ion-item>
              <ion-label>{{ field.label }}</ion-label>
              <ion-input></ion-input>
            </ion-item>
          </ion-list>

        </ion-content>
        <ion-footer>
          <ion-list style="display: flex; justify-content: space-between;">
            <ion-item lines="none" style="flex: 1 1 50%;">
              <ion-button style="width: 100%; height: 100%;" type="submit" size="large" fill="clear">重置</ion-button>
            </ion-item>
            <ion-item lines="none" style="flex: 1 1 50%;">
              <ion-button type="submit" style="width: 100%; height: 100%;"  fill="clear" size="large" >搜索</ion-button>
            </ion-item>

          </ion-list>
        </ion-footer>
      </ion-menu>
</template>

<script lang="ts">
import {
  IonHeader, IonContent,
  IonButtons, IonToolbar, IonTitle, IonIcon, IonInput, IonFooter, IonButton,
  IonLabel, IonItem, IonList, IonMenu, IonMenuButton,
} from '@ionic/vue';
import { defineComponent, PropType } from 'vue';
import {   toRefs } from '@vue/reactivity';
import { searchCircleOutline, arrowBackOutline } from 'ionicons/icons';
import { Entities, FormField, getEntityStore }  from '@/share/entity';


export default defineComponent({
  name: 'SearchForm',
  components: {
    IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonContent,
    IonLabel, IonInput, IonFooter, IonButton,
    IonButtons, IonMenu, IonMenuButton, IonIcon
  },
  props: {
    entityName: {type: String as PropType<Entities>, required: true},
    forms: {
      type: Array as PropType<Array<FormField>>,
      required: true
    },
  },
  setup(props) {
    const entityStore = getEntityStore(props.entityName);
    const {forms: searchForm} = toRefs(props);
    
    return {
      searchCircleOutline, arrowBackOutline, searchForm
    };
  },
});
</script>
