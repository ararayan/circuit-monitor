<template>
  <ion-page class="segments-edit-view">
    <ion-header translucent>
      <ion-toolbar mode="md" color="primary">
        <ion-buttons slot="start">
          <ion-back-button :default-href="defaultHref"></ion-back-button>
        </ion-buttons>
        <ion-title center>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" style="position: relative;">
      <canvas id="base-layer-canvas" width=480 height=640 @pointerdown="edit($event)"></canvas>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { Entities, useEntityContext } from '@/share';
import { useEntityEditFormStore, SwitchItemStateInfo } from '@/share/entity';
import { useUserStore } from '@/share/user';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter, useBackButton } from '@ionic/vue';
import { computed } from '@vue/reactivity';
import { cloudOutline, discOutline, locateOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { defineComponent, onMounted, onUnmounted } from 'vue';


export default defineComponent({
  name: 'WiringsEditView',
  components: {
    IonPage, IonHeader, IonContent,
    IonButtons, IonBackButton, IonToolbar, IonTitle,
  },
  setup() {
    const ionRouter = useIonRouter();
    const { entityName, recordId } = useEntityContext();
    const userStore = useUserStore();

    const { menus } = storeToRefs(userStore);
    const title = computed(() => {
      return menus.value.find(item => item.id === entityName)?.name || '';
    });
    const defaultHref = entityName ? `/entity/${entityName}` : '/home';

    const result = useBackButton(10, () => {
      ionRouter.back();
    });
    onMounted(() => {
      const baseLayerCanvas = document.querySelector('#base-layer-canvas') as HTMLCanvasElement;
      const baseLayerCtx = baseLayerCanvas.getContext('2d') as CanvasRenderingContext2D;

      const mainViewImage = new Image();
      mainViewImage.src = 'assets/wiring/base.png';
      mainViewImage.onload = () => {
        // const ratio = mainViewImage.naturalWidth/480; 1200 * 902
        // const targetHeight = mainViewImage.naturalHeight * ratio; 
        baseLayerCtx.drawImage(mainViewImage, 0, 0, 480, 360);
      };
    });
    const edit = function (event: PointerEvent) {
      const clickedItemId = '1';
      const entityEditFormStore = useEntityEditFormStore(Entities.Operations, clickedItemId);
      entityEditFormStore.$patch({
        currRecordInfo: {
          kfId: '1',
          khId: '2',
        } as SwitchItemStateInfo
      });
      ionRouter.push({
        path: `/entity/${entityName}/${recordId}/${Entities.Operations}/${clickedItemId}`,
        query: {
          skipSelfEntity: 1
        }
      });
    };



    onUnmounted(() => {
      result.unregister();
    });
    return { entityName, title, defaultHref, cloudOutline, discOutline, locateOutline, edit };
  }
});
</script>
<style>
.bg-contrast-danger {
  background-color: let(--ion-color-secondary-contrast, #fff);
}

.bg-contrast-success {
  background-color: let(--ion-color-success-contrast, #fff);
}

#base-layer-canvas {
  position: absolute;
  top: 0;
  left: 0;
}

#dynamic-layer-canvas {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
