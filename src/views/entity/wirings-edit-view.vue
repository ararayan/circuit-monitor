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
          <canvas id="base-layer-canvas" width="480" height="768"></canvas>
          <canvas id="dynamic-layer-canvas" width="480" height="768" @pointerdown="edit($event)"></canvas>
        </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { useEntityContext } from '@/share';
import { useUserStore } from '@/share/user';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { computed } from '@vue/reactivity';
import { cloudOutline, discOutline, locateOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { defineComponent, onMounted } from 'vue';

const getCircuitCanvas = (id: string) => {
  const wW =window.innerWidth;
  const wH =window.innerHeight;
  const canvasHTML= document.getElementById(id) as HTMLCanvasElement;
  canvasHTML.width=wW;
  canvasHTML.height=wH;
  const ctx  =canvasHTML.getContext("2d") as CanvasRenderingContext2D;
  let ix: number;
  let iy: number;
  let x: number;
  let y: number;
  let d: number;
  let dx: number;
  let dy: number;

  function beginCircuit(a: number, b: number)
  {
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    x=a;
    y=b;
    d=0;
    dx=1;
    dy=0;
    ix=x;
    iy=y;
    ctx.moveTo(x,y);
    drawWire(50);
    drawPower();
  }

  function endCircuit()
  {
    ctx.lineTo(ix,iy);
    ctx.stroke();
  }

  function drawWire(l: number)
  {
    x += dx*l;
    y += dy*l;
    ctx.lineTo(x,y);
  }       

  function drawPower()
  {
    let n;
    drawWire(10);
    n=3;
    ctx.moveTo(x+10*dy,y+10*dx);
    ctx.lineTo(x-10*dy,y-10*dx);
    x += dx*5;
    y += dy*5;
    while(n--)
    {
      ctx.moveTo(x + 15*dy, y + 15*dx);
      ctx.lineTo(x - 15*dy, y - 15*dx);
      x += dx*5;
      y += dy*5;
      ctx.moveTo(x + 10*dy, y + 10*dx);
      ctx.lineTo(x - 10*dy, y - 10*dx);
      if(n != 0)
      {
        x += dx*5;
        y += dy*5;
      }
    }
    ctx.moveTo(x,y);
    drawWire(10);
  }

  function drawCapacitor()
  {
    drawWire(22.5);
    ctx.moveTo(x+10*dy,y+10*dx);
    ctx.lineTo(x-10*dy,y-10*dx);
    x+=dx*5;
    y+=dy*5;
    ctx.moveTo(x+10*dy,y+10*dx);
    ctx.lineTo(x-10*dy,y-10*dx);
    ctx.moveTo(x,y);
    drawWire(22.5);
  }

  function drawInductor()
  {
    let n,xs,ys;
    drawWire(9);
    n=4;
    xs=1+Math.abs(dy);
    ys=1+Math.abs(dx);
    x+=dx*6;
    y+=dy*6;
    ctx.scale(xs,ys);
    while(n--)
    {
      ctx.moveTo(x/xs+5*Math.abs(dx), y/ys+5*dy);
      ctx.arc( x/xs, y/ys, 5, Math.PI/2*dy, Math.PI+Math.PI/2*dy, true);
      x+=6.5*dx;
      y+=6.5*dy;
      if(n!=0)
      {
        if(dx>=0)
        {
          ctx.moveTo(x/xs-5*dx,y/ys-5*dy);
        }
                    
        ctx.moveTo(x/xs-5*dx,y/ys-5*dy);
        ctx.arc(x/xs-6.5/2*dx,y/ys-6.5/2*dy,1.5,Math.PI+Math.PI/2*dy,Math.PI/2*dy, true);
      }
    }
    ctx.moveTo(x/xs-1.75*dx,y/ys-1.75*dy);
    ctx.scale(1/xs,1/ys);
    ctx.lineTo(x,y);
    drawWire(9);
  }

  function drawTrimmer()
  {
    ctx.moveTo(x+35*dx-7*dy,y+35*dy-7*dx);
    ctx.lineTo(x+15*dx+7*dy,y+15*dy+7*dx);
    ctx.moveTo(x+13*dx+4*dy,y+13*dy+4*dx);
    ctx.lineTo(x+17*dx+10*dy,y+17*dy+10*dx);
    ctx.moveTo(x,y);
    drawCapacitor();
  }

  function drawResistor()
  {
    let n;
    drawWire(10);
    n=5;
    x+=dx*5;
    y+=dy*5;
    while(n--)
    {
      ctx.lineTo(x-5*dy,y-5*dx);
      ctx.lineTo(x+5*dy,y+5*dx);
      x+=5*dx;
      y+=5*dy;
    }
    ctx.lineTo(x,y);
    drawWire(10);
  }

  function turnClockwise()
  {
    d++;
    dx=Math.cos(1.570796*d);
    dy=Math.sin(1.570796*d);
  }

  function turnCounterClockwise()
  {
    d--;
    dx=Math.cos(1.570796*d);
    dy=Math.sin(1.570796*d);
  }
  return {
    beginCircuit, endCircuit, drawWire, drawPower, drawCapacitor,  drawInductor, drawTrimmer, drawResistor, turnClockwise, turnCounterClockwise
  };
};

function isPointInRect(point: {x: number; y: number;}, rect: {left: number; top: number; right: number; bottom: number} ) {
  return rect.left <= point.x && point.x <= rect.right && rect.top <= point.y && point.y <= rect.bottom;
}

export default defineComponent({
  name: 'WiringsEditView',
  components: {
    IonPage,IonHeader, IonContent,
    IonButtons, IonBackButton, IonToolbar, IonTitle,
  },
  setup() {
    const { entityName } = useEntityContext();
    const userStore = useUserStore();
    const { menus }  = storeToRefs(userStore);
    const title = computed(() => {
      return menus.value.find(item => item.id === entityName)?.name || '';
    });
    const defaultHref = entityName ? `/entity/${entityName}` : '/home';

    onMounted(() => {
      // const draw = getCircuitCanvas('circuit');
      // draw.beginCircuit(10, 10);
      // draw.drawCapacitor();
      // draw.drawPower();
      // draw.drawInductor();
      // draw.drawResistor();
      // draw.endCircuit();
      const baseLayerCanvas = document.querySelector('#base-layer-canvas') as HTMLCanvasElement;
      const baseLayerCtx = baseLayerCanvas.getContext('2d') as CanvasRenderingContext2D;
      const dynamicLayerCanvas = document.querySelector('#dynamic-layer-canvas') as HTMLCanvasElement;
      const dynamicLayerCtx = dynamicLayerCanvas.getContext('2d') as CanvasRenderingContext2D;

      const mainViewImage = new Image();
      mainViewImage.src = 'assets/wirings/Mainview.bmp';
      mainViewImage.onload = () => {
        const width = mainViewImage.naturalWidth;
        const height = mainViewImage.naturalHeight;
        baseLayerCtx.drawImage(mainViewImage, 0, 0, width, height);
      };
      const open0357 = new Image();
      open0357.src = 'assets/wirings/0357_open.bmp';
      open0357.onload = () => {
        const width = open0357.naturalWidth;
        const height = open0357.naturalHeight;
        dynamicLayerCtx.drawImage(open0357, 53, 81, width, height);
      };

      const cls0358 = new Image();
      cls0358.src = 'assets/wirings/0358_cls.bmp';
      cls0358.onload = () => {
        const width = cls0358.naturalWidth;
        const height = cls0358.naturalHeight;
        dynamicLayerCtx.drawImage(cls0358, 34, 117, width, height);
      };
    });
    const edit = function (event: PointerEvent) {
      const x = event.clientX;
      const y = event.clientY;
      
    };

    const openModal = async function() {
      // const modal = await modalController.create({
      //   component: 'modal-content',
      //   ...opts,
      // });
      // modal.present();
      // return modal;
    };
    return {entityName, title, defaultHref, cloudOutline, discOutline, locateOutline, openModal, edit};
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
