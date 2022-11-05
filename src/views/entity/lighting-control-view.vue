<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar mode="md" color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title center>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen>
      <ion-list v-for="item in records" :key="item.id">
        <ion-item>
          <ion-label>
            <h2> <i class="seq-number">{{ item.seq || '' }}</i>{{ item.name }}</h2>
            <!-- <h3><i class="seq-number seq-number-transparent">{{ item.seq || '' }}</i> {{ ControlStatusCodeTexts[item.status as ControlStatusCode] }}</h3> -->
            <!-- <p> {{ControlStatusCodeTexts[item.status as ControlStatusCode]}} </p> -->
          </ion-label>
          <!-- <ion-toggle slot="end" name="item.id" :color="item.isPendingStatus ? 'warning' : 'success' " mode="ios" :checked="item.status === 'he'"></ion-toggle> -->
          <!-- <ion-toggle slot="end" name="item.id" color="success" mode="ios" :checked="item.status === 'he'" class="toggle-disabled"></ion-toggle> -->
          <ion-button :v-if="[ControlStatusCode.He, ControlStatusCode.Fen].includes(item.status)"
            @click="applyForEdit(item, item.status === ControlStatusCode.Fen ? ControlStatusCode.He : ControlStatusCode.Fen)"
            style="min-width: 5em; min-height: 2.5em; margin-right: 1em;" color="light">
            <ion-icon :icon="rocketOutline" slot="start" color="warning"></ion-icon>
            <ion-label color="primary">{{ LightControlStatusCodeTexts[item.status as ControlStatusCode]}}</ion-label>
          </ion-button>
        </ion-item>
      </ion-list>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { DataStatus, EntityRecordAlias, ToastType, useEntityContext, useEntityDisplayName, useEntityRecordsStore, YxOperatorParams } from '@/share';
import { ControlStatusCode } from '@/share/entity/data/operations';
import { Components } from '@ionic/core/dist/types/components';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar, toastController } from '@ionic/vue';
import { arrowBackOutline, chevronForwardOutline, rocketOutline, searchCircleOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { defineComponent, onMounted, onUnmounted, watch, WatchStopHandle } from 'vue';


const LightControlStatusCodeTexts = {
  [ControlStatusCode.He]: '关闭',
  [ControlStatusCode.Fen]: '打开',
  [ControlStatusCode.HeWx]: '关闭(无效)',
  [ControlStatusCode.FenWx]: '打开(无效)',
};

export default defineComponent({
  name: 'LightingControlView',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonContent,
    IonLabel, IonButton, IonButtons, IonBackButton, IonIcon
  },
  setup() {
    const { entityName } = useEntityContext();
    const { title } = useEntityDisplayName(entityName);
    const recordStore = useEntityRecordsStore(entityName);
    const { records, toastMsg, toastType } = storeToRefs(recordStore);

    //#region init store
    recordStore.setSyncFields(['status']);
    recordStore.setHasPagination(false);

    recordStore.getRecords(entityName, { isInit: true });

    const disposeRecordsWatch = watch(records, () => {
      if (records.value.length && recordStore.meta.records === DataStatus.Loaded) {
        recordStore.startRecordsCheck();
        disposeRecordsWatch();
      }
    });

    //#endregion

    let msgSubscription: WatchStopHandle;
    const toastInstaces: Components.IonToast[] = [];
    onMounted(() => {
      msgSubscription = watch(toastMsg, (next, prev) => {
        if (next !== prev && !!next) {
          toastController
            .create({
              message: next,
              duration: 2000,
              color: toastType.value === ToastType.Success ? toastType.value : 'danger'
            }).then(toast =>  {
              toastInstaces.push(toast);
              return toast.present();
            });
        }
      }, { immediate: true });
    });
    onUnmounted(() => {
      msgSubscription?.();
      disposeRecordsWatch?.();
      toastInstaces.forEach(toast => toast.dismiss());
      recordStore.destroy();
    });
    function applyForEdit(item: EntityRecordAlias, action: ControlStatusCode) {
      const data: YxOperatorParams = {
        yxIds: item.yxId,
        kfId: item.kfId,
        khId: item.khId,
        action: action,
        type: 'zm',
      };
      recordStore.requestExcute(data);
    }
    return {
      entityName, rocketOutline, ControlStatusCode, applyForEdit, LightControlStatusCodeTexts,
      records, title, searchCircleOutline, arrowBackOutline, chevronForwardOutline
    };
  },
});
</script>
<style>
.scroller {
  /* 100% => Rendered items limit reached, issue: https://github.com/Akryum/vue-virtual-scroller/issues/78; */
  height: 100%;
}
.seq-number {
  margin-right: 1em;
  color: var(--ion-color-medium);
}
.seq-number:empty {
  margin-right: 0;
}
.seq-number-transparent {
  color: transparent;
  opacity: 0;
}
</style>
