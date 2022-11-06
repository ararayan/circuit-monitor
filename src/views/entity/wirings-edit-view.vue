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
    <ion-content class="ion-padding" style="position: relative;" :scroll-x="true" >
      <canvas id="base-layer-canvas" :width="width" :height="height"></canvas>
      <canvas id="control-layer" :width="width" :height="height"
        @pointerdown="edit($event)"></canvas>
      <canvas id="fonts-layer" :width="width" :height="height"></canvas>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { Entities, PCBBaseMapItem, PCBRect, PCBSwitchItem, ControlStatusIds, SwitchItemStatusImageKeyMap, useEntityContext, useEntityEditFormStore, useEntityPCBStore, PCBFontItem } from '@/share';
import { useUserStore } from '@/share/user';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter, useBackButton, onIonViewDidLeave, onIonViewDidEnter } from '@ionic/vue';
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
    const { width, height, baseMapItem } = storeToRefs(pcbStore);

    pcbStore.getPCBInfos(recordId);
    let canvasSwitchItemInfos = {} as Record<string, PCBRect>;

    onMounted(() => {
      const baseLayerCanvas = document.querySelector('#base-layer-canvas') as HTMLCanvasElement;
      const baseLayerCtx = baseLayerCanvas.getContext('2d') as CanvasRenderingContext2D;
      const dynamicLayerCanvas = document.querySelector('#control-layer') as HTMLCanvasElement;
      const dynamicLayerCtx = dynamicLayerCanvas.getContext('2d') as CanvasRenderingContext2D;
      const fontsLayerCanvas = document.querySelector('#fonts-layer') as HTMLCanvasElement;
      const fontsLayerCtx = fontsLayerCanvas.getContext('2d') as CanvasRenderingContext2D;

      let switchItemsAsyncLotId = '';

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
            dynamicLayerCtx.clearRect(0, 0, dynamicLayerCanvas.width, dynamicLayerCanvas.height);
            switchItemsAsyncLotId = new Date().getTime().toString();
            canvasSwitchItemInfos = {} as Record<string, PCBRect>;
            // const switchItems = mutation.payload.switchItems as Record<string, PCBSwitchItem>;
            Object.entries(pcbStore.switchItems).forEach(([, switchItem]) => {
              const imageName = SwitchItemStatusImageKeyMap[switchItem.value];
              const valueImgString = switchItem[imageName as keyof PCBSwitchItem];
              if (valueImgString) {
                const switchImage = new Image();
                switchImage.src = 'data:image/jpeg;base64,' + valueImgString;
                switchImage.dataset['lotId'] = switchItemsAsyncLotId;
                switchImage.onload = () => {
                  if (switchItemsAsyncLotId ===  switchImage.dataset['lotId']) {
                    const { left, top } = switchItem;
                    const width = switchImage.naturalWidth;
                    const height = switchImage.naturalHeight;
                    dynamicLayerCtx.drawImage(switchImage, left, top);
                    const right = left + width;
                    const bottom = top + height;
                    canvasSwitchItemInfos[switchItem.id] = { left, right, top, bottom };
                  }
                };
              }
            });
          
          }
          if (mutation.payload.fontItems) {
            // font-layer
            fontsLayerCtx.clearRect(0, 0, fontsLayerCanvas.width, fontsLayerCanvas.height);
            const fontItems = mutation.payload.fontItems as PCBFontItem[];
            fontItems.forEach(item => {
              const fontInfo = item.fontGB2312.split('|')?.reduce((acc, x) => {
                if (x?.startsWith("lfWeight")) {
                  const weightHex = x.split('=')?.[1];
                  const weight = parseInt(weightHex, 16) || 500;
                  acc['weight'] = weight;
                } else if (x?.startsWith("lfItalic")) {
                  const italicHex = x.split('=')?.[1];
                  const italic = parseInt(italicHex, 16) || 0;
                  acc['italic'] = !!italic;
                } else if (x?.startsWith("lfHeight")) {
                  const heightHex = x.split('=')?.[1];
                  const height = parseInt(heightHex.split('0xff')?.[1], 16) || 0;
                  acc['height'] = height;
                }
                return acc;
              }, {} as Record<'weight' | 'italic' | 'height', any>);

              const cssHexColorValue = item.colorRGB.split("0x00")[1];
              // general: bold 700 and normal was 400, other may key not compality with multiple platform;
              fontsLayerCtx.font = `${fontInfo.italic ? 'italic ' : '' }${fontInfo.weight === 400 ? '' : 'bold '}14px GB2312, Droid Sans, Droid Serif`;
              fontsLayerCtx.fillStyle =`#${cssHexColorValue}`;
              fontsLayerCtx.textBaseline = 'top';
              fontsLayerCtx.fillText(item.label, item.left, item.top);
            });
          }
        }
        // draw canvas image
      }, { detached: true, immediate: true });

      const disposeInitSubscription = pcbStore.$subscribe((mutation) => {
        if (mutation.type === MutationType.patchObject) {
          if (mutation.payload.isInited) {
            pcbStore.startSwitchItemsCheck();
            disposeInitSubscription();
          }
        }
      }, {detached: true});
      
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
          } as ControlStatusIds
        });
        ionRouter.push({
          path: `/entity/${entityName}/${recordId}/${Entities.Operations}/${clickedItemId}`,
          query: {
            skipSelfEntity: 1
          }
        });
      }
    };

    const backBtnSubscription = useBackButton(10, () => {
      ionRouter.back();
    });

    const ionLifeCycleSubs = [] as Array<() => void>;
    ionLifeCycleSubs.push(
      onIonViewDidEnter(() => {
        pcbStore.setPageReady(true);
      }) as any,
      onIonViewDidLeave(() => {
        pcbStore.setPageReady(false);
      }) as any,
    );
    onUnmounted(() => {
      backBtnSubscription.unregister();
      pcbStore.destroy();
      ionLifeCycleSubs.forEach(sub => sub?.());
    });
    return { entityName, title, defaultHref, cloudOutline, discOutline, locateOutline, edit, baseMapItem, width, height, };
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
  z-index: 1;
}

#control-layer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
}
#fonts-layer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}
</style>
