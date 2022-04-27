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
          <ion-text>under construct...</ion-text>
           <canvas id="circuit" @click="openModal()"></canvas>
        </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { getMatchedEntityInfoByRoute } from '@/share';
import { useUserStore } from '@/share/user';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonText } from '@ionic/vue';
import { computed } from '@vue/reactivity';
import { cloudOutline, discOutline, locateOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { defineComponent, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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


export default defineComponent({
  name: 'OperationsEditView',
  components: {
    IonPage,IonHeader, IonContent, IonText,
    IonButtons, IonBackButton, IonToolbar, IonTitle,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { entityName } = getMatchedEntityInfoByRoute(route);
    const userStore = useUserStore();
    const { menus }  = storeToRefs(userStore);
    const title = computed(() => {
      return menus.value.find(item => item.id === entityName)?.name || '';
    });
      
    const backto = () => {
      router.push(`/entity/${entityName}`);
    };
    onMounted(() => {
      const draw = getCircuitCanvas('circuit');
      draw.beginCircuit(10, 10);
      draw.drawCapacitor();
      draw.drawPower();
      draw.drawInductor();
      draw.drawResistor();
      draw.endCircuit();
    });
    const openModal = async function(opts = {}) {
      // const modal = await modalController.create({
      //   component: 'modal-content',
      //   ...opts,
      // });
      // modal.present();
      // return modal;
    };
    return {entityName, title, backto, cloudOutline, discOutline, locateOutline, openModal};
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
</style>