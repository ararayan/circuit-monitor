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
      <canvas id="base-layer-canvas" :width="baseMapItem.width" :height="baseMapItem.height"></canvas>
      <canvas id="dynamic-layer-canvas" :width="baseMapItem.width" :height="baseMapItem.height"
        @pointerdown="edit($event)"></canvas>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { Entities, PCBBaseMapItem, PCBRect, PCBSwitchItem, SwitchItemStateInfo, SwitchItemStatusImageKeyMap, useEntityContext, useEntityEditFormStore, useEntityPCBStore } from '@/share';
import { useUserStore } from '@/share/user';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter } from '@ionic/vue';
import { computed } from '@vue/reactivity';
import { cloudOutline, discOutline, locateOutline } from 'ionicons/icons';
import { MutationType, storeToRefs } from 'pinia';
import { defineComponent, onMounted, onUnmounted } from 'vue';


function isPointInRect(point: { x: number; y: number; }, rect: PCBRect) {
  return rect.left <= point.x && point.x <= rect.right && rect.top <= point.y && point.y <= rect.bottom;
}

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
    const pcbStore = useEntityPCBStore(entityName, recordId);
    const { baseMapItem } = storeToRefs(pcbStore);

    pcbStore.getPCBInfos(recordId);
    let canvasSwitchItemInfos = {} as Record<string, PCBRect>;

    onMounted(() => {
      const baseLayerCanvas = document.querySelector('#base-layer-canvas') as HTMLCanvasElement;
      const baseLayerCtx = baseLayerCanvas.getContext('2d') as CanvasRenderingContext2D;
      const dynamicLayerCanvas = document.querySelector('#dynamic-layer-canvas') as HTMLCanvasElement;
      const dynamicLayerCtx = dynamicLayerCanvas.getContext('2d') as CanvasRenderingContext2D;

      pcbStore.$subscribe((mutation) => {
        if (mutation.type === MutationType.patchObject) {
          if (mutation.payload.baseMapItem) {
            const baseMapItem: PCBBaseMapItem = mutation.payload.baseMapItem as PCBBaseMapItem;
            const mainViewImage = new Image();
            mainViewImage.src = 'data:image/jpeg;base64,' + baseMapItem.value;
            mainViewImage.onload = () => {
              baseLayerCtx.drawImage(mainViewImage, 0, 0);
            };
          }
          if (mutation.payload.switchItems) {
            canvasSwitchItemInfos = {} as Record<string, PCBRect>;
            const switchItems = mutation.payload.switchItems as Record<string, PCBSwitchItem>;
            Object.entries(switchItems).forEach(([, switchItem]) => {
              const imageName = SwitchItemStatusImageKeyMap[switchItem.value];
              const valueImgString = switchItem[imageName as keyof PCBSwitchItem];
              if (valueImgString) {
                const switchImage = new Image();
                switchImage.src = 'data:image/jpeg;base64,' + valueImgString;
                switchImage.onload = () => {
                  const { left, top } = switchItem;
                  const width = switchImage.naturalWidth;
                  const height = switchImage.naturalHeight;
                  dynamicLayerCtx.drawImage(switchImage, left, top);
                  const right = left + width;
                  const bottom = top + height;
                  canvasSwitchItemInfos[switchItem.id] = { left, right, top, bottom };
                };
              }
            });
          }
        }
        // draw canvas image
      }, { detached: true, immediate: true });

      //#WIP
      pcbStore.startSwitchItemsCheck();
    });
    const edit = function (event: PointerEvent) {
      const { offsetX: x, offsetY: y } = event;
      const clickedItemId = Object.entries(canvasSwitchItemInfos).find(([, value]) => {
        return isPointInRect({ x, y }, value);
      })?.[0] || '';
      if (clickedItemId !== '') {
        const switchItem = pcbStore.getSwitchItem(clickedItemId);
        const entityEditFormStore = useEntityEditFormStore(Entities.Operations, clickedItemId);
        entityEditFormStore.$patch({
          currRecordInfo: {
            kfId: switchItem.kf,
            khId: switchItem.kh,
          } as SwitchItemStateInfo
        });
        ionRouter.push({
          path: `/entity/${entityName}/${recordId}/${Entities.Operations}/${clickedItemId}`,
          query: {
            skipSelfEntity: 1
          }
        });
      }
    };



    onUnmounted(() => {
      pcbStore.destroy();
    });
    return { entityName, title, defaultHref, cloudOutline, discOutline, locateOutline, edit, baseMapItem };
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
