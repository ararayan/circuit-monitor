<template>
  <ion-page>
    <ion-split-pane :contentId="menuConnectId" when="false">
      <main-menus :contentId="menuConnectId" menuId="main-menu" type="push"></main-menus>
      <div class="ion-page" :id="menuConnectId">
        <ion-header mode="md" collapse="fade">
          <ion-toolbar mode="md" color="primary">
            <ion-buttons slot="start">
              <ion-menu-button autoHide="false" menu="main-menu"></ion-menu-button>
            </ion-buttons>
            <ion-title center>衍能科技</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true" class="ion-padding-bottom">
          <ion-slides :options="sliderOptions">
            <ion-slide>
                <div class="slide">
                <img src="assets/sliders/electricy.jpg" />
              </div>
         
            </ion-slide>
            <ion-slide>
              <div class="slide">
                <img src="assets/sliders/engercy.jpg" />
              </div>
            </ion-slide>
            <ion-slide>
                  <div class="slide">
                <img src="assets/sliders/wind.jpg" />
              </div>
            </ion-slide>

          </ion-slides>
          <ion-grid style="max-width: 920px;">
            <ion-row>
              <template v-for="item in menus" :key="item.id">
                <ion-col size="4" size-sm="4">
                  <div class="gridcard ion-activatable ripple-parent" @click="gotoEntityView(item.id)">
                    <ion-icon :src="`assets/home/${item.id}.svg`" color="primary" class="gridcard-icon"></ion-icon>
                    <ion-label class="gridcard-text" style="padding-top: 0.75em;">{{ item.name }}</ion-label>
                    <ion-ripple-effect></ion-ripple-effect>
                  </div>
                </ion-col>
              </template>
            </ion-row>
          </ion-grid>

          <!-- <ion-grid>
            <ion-row>

              <ion-col size="12" size-sm="12" size-md="4">
                <ion-card>
                  <ion-card-header>
                    <ion-card-title>电力系统</ion-card-title>
                  </ion-card-header>
                  <img src="assets/card/electric.jpg" />
                  <ion-card-content>
                    电力系统在各个环节和不同层次还具有相应的信息与控制系统，对电能的生产过程进行测量、调节、控制、保护、通信和调度，以保证用户获得安全、优质的电能。
                  </ion-card-content>
                </ion-card>
              </ion-col>
              <ion-col size="12" size-sm="12" size-md="4">
                <ion-card>
                  <ion-card-header>
                    <ion-card-title>新能源领域</ion-card-title>
                  </ion-card-header>
                  <img src="assets/card/wind.jpeg" />
                  <ion-card-content>
                    新能源普遍具有污染少、储量大的特点，对于解决当今世界严重的环境污染问题和资源（特别是化石能源）枯竭问题具有重要意义。
                  </ion-card-content>
                </ion-card>
              </ion-col>
              <ion-col size="12" size-sm="12" size-md="4">

                <ion-card>
                  <ion-card-header>
                    <ion-card-title>工业领域</ion-card-title>
                  </ion-card-header>
                  <img src="assets/card/engercy.jpg" />
                  <ion-card-content>
                    工业还为自身和国民经济其他各个部门提供原材料、燃料和动力，为人民物质文化生活提供工业消费品；它还是国家财政收入的主要源泉，是国家经济自主、政治独立、国防现代化的根本保证。
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>
 -->

 

        </ion-content>
              <ion-footer class="ion-text-center main-menu-footer" mode="md">
        <ion-note>{{appInfo}}</ion-note>
      </ion-footer>

      </div>
    </ion-split-pane>
  </ion-page>
</template>

<script lang="ts">
import { App } from '@capacitor/app';
import { defineComponent } from 'vue';
import { ref, } from '@vue/reactivity';
import { 
  IonPage, IonHeader, IonGrid, IonRow, IonCol, IonButtons, IonMenuButton, IonFooter, IonNote,
  IonToolbar, IonTitle, IonContent, IonIcon, IonLabel, IonRippleEffect, IonSplitPane, IonSlides, IonSlide, onIonViewWillEnter, onIonViewDidEnter, onIonViewWillLeave, onIonViewDidLeave, useIonRouter,
} from '@ionic/vue';
import { useUserStore } from '@/share/user';
import { storeToRefs } from 'pinia';
import { personOutline, homeOutline } from 'ionicons/icons';
import MainMenus from '@/components/main-menus.vue';


export default defineComponent({
  name: 'HomeView',
  components: {
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonIcon, IonGrid, IonRow, IonCol, IonButtons, IonSlides, IonSlide, IonFooter, IonNote,
    IonLabel, IonRippleEffect, IonMenuButton, MainMenus, IonSplitPane, 
  },
  setup() {
    const user = useUserStore();
    const { menus } = storeToRefs(user);
    const router = useIonRouter();
    const appInfo = ref<string>('');
    function gotoEntityView(path: string) {
      router.push('/entity/' + path);
    }
    const menuConnectId = ref('home-menu-connect');
    const sliderOptions = {
      initialSlide: 0,
      slidesPerView: 1,
      autoplay:true
    };
    App.getInfo().then(info => {
      appInfo.value = `${info.id}_${info.name}_${info.version}_${info.build}`;
    });

    
    onIonViewWillEnter(() => {
      // debugger;
      // ionic view will enter;
    });
    onIonViewDidEnter(() => {
      // debugger;
      // ionic view did enter;
    });
    onIonViewWillLeave(() => {
      // debugger;
      // ionic view will leave;
    });
    onIonViewDidLeave(() => {
      // debugger;
      // ionic view did leave;
    });

    return {
      menus, gotoEntityView, personOutline, homeOutline, menuConnectId, sliderOptions, appInfo
    };
  },
});
</script>
<style>
.header {
  background-color: var(--ion-color-base);
}

.gridcard {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 8em;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #f4f4f4;
}

.gridcard-icon {
  font-size: 4em;
}
.main-menu-footer {
  background: #f7f8fb;
}
.main-menu-footer > ion-note {
  font-size: 12px;
    color: #97a0af;
    font-style: italic;
}
</style>
