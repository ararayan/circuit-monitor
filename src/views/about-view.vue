<template>
<ion-page>
  <ion-header translucent>
          <ion-toolbar mode="md" color="primary">
            <ion-buttons slot="start">
              <ion-back-button default-href="/home"></ion-back-button>
            </ion-buttons>
            <ion-title center>关于</ion-title>
          </ion-toolbar>
        </ion-header>
    <ion-content style="--ion-background-color: transparent" color="light">
    <div class="ion-padding">
       <ion-img src="/assets/about.jpg" class="ion-margin-bottom" ></ion-img>
       
        <ion-text >
               广州衍能电力科技有限公司（简称衍能科技）是一家专业从事智能电网、物联网光电传感设备、电力系统自动化、电力设备在线监测系统、安防及环境监测系统等相关领域软硬件的研发、生产、销售和技术服务的高科技创新型企业。公司坚持“质量为前提、服务为根本、创新为保障”的发展理念，致力成为国内一流的电力系统自动化物联网技术解决方案提供商，聚焦客户需求，不断提升满足客户需求的能力。
       衍能科技依托专业的研发队伍作为技术后盾，为满足市场需要，自主研发YN-3000电气接点无线无源测温系统、YN-1800智能型电力电缆运行状态健康管理平台、YN-9000蓄电池在线监测及远程自动维护系统、YN-3300变电站综合自动化系统、YNCloud-1000A电气云监控平台、YN-2000计量管理系统、YN-900A变电站智能辅助系统等一系列电力自动化及网络产品。目前已广泛应用于发电、配电、石油、化工、冶金、煤矿等各个领域，多项业务出口至东南亚、欧美等海外市场。
        </ion-text>
       
     

    </div>

    </ion-content>
    <ion-footer  class="ion-no-border" style="padding: 0.5em 2em; display: flex; justify-content: center; background-color: var(--ion-color-light, #f4f5f8); ">
      <ion-button @click="openUrl()" color="primary" >访问官网主页</ion-button>
    </ion-footer>
</ion-page>
      
</template>
<script lang="ts">
import { IonBackButton, IonButtons, IonFooter, IonButton, IonContent, IonHeader, IonImg, IonPage, IonText, IonTitle, IonToolbar } from '@ionic/vue';
import { defineComponent } from 'vue';
import { AppLauncher } from '@capacitor/app-launcher';

export default defineComponent({
  name: 'AboutView',
  components: {
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonImg, IonText, IonTitle,
    IonContent, IonPage, IonButton, IonFooter,
  },
  setup() {
    function openUrl() {
      AppLauncher.openUrl({ url: 'http://www.gzyanneng.com/' });
    }
    return { openUrl };
  }
});
</script>
