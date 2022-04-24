<template>
  <ion-page>
    <ion-split-pane :contentId="menuConnectId" when="(min-width: 2400px)">
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
        <ion-content :fullscreen="true">
          <ion-slides>
            <ion-slide>
              <div class="slide">
                <img src="assets/cm-messaging.png" />
                <h2>Welcome</h2>
                <p>
                  The <b>ionic conference app</b> is a practical preview of the ionic framework in action, and a
                  demonstration of proper code use.
                </p>
              </div>
            </ion-slide>
            <ion-slide>
               <div class="slide">
              <img src="assets/biz-analysis.png" />
              <h2>What is Ionic?</h2>
               </div>
            </ion-slide>
          </ion-slides>
          <ion-grid>
            <ion-row>
              <template v-for="item in menus" :key="item.id">
                <ion-col size="6" size-sm="6">
                  <div class="gridcard ion-activatable ripple-parent" @click="goto(item.id)">
                    <ion-icon :src="`assets/home/${item.id}.svg`" color="primary" class="gridcard-icon"></ion-icon>
                    <ion-label class="gridcard-text" style="padding-top: 0.75em;">{{ item.name }}</ion-label>
                    <ion-ripple-effect></ion-ripple-effect>
                  </div>
                </ion-col>
              </template>
            </ion-row>
          </ion-grid>
        </ion-content>
      </div>
    </ion-split-pane>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { ref, reactive } from '@vue/reactivity';
import {
  IonPage, IonHeader, IonGrid, IonRow, IonCol, IonButtons, IonMenuButton,
  IonToolbar, IonTitle, IonContent, IonIcon, IonLabel, IonRippleEffect, IonSplitPane, IonSlides, IonSlide,
} from '@ionic/vue';
import { useUserStore } from '@/share/user';
import { storeToRefs } from 'pinia';
import { personOutline, homeOutline } from 'ionicons/icons';
import MainMenus from '@/components/MainMenus.vue';


export default defineComponent({
  name: 'HomeView',
  components: {
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonIcon, IonGrid, IonRow, IonCol, IonButtons, IonSlides, IonSlide,
    IonLabel, IonRippleEffect, IonMenuButton, MainMenus, IonSplitPane
  },
  setup() {
    const user = useUserStore();
    // user.getUserMenu();
    const { menus } = storeToRefs(user);
    const router = useRouter();
    function goto(path: string) {
      router.push('/entity/' + path);
    }
    (window as any).tt = router;
    // const route = useRoute();
    // watch(route, (to, from) => {});
    // onBeforeRouteLeave((to, from) => {})
    // onBeforeRouteUpdate(async (to) => {});
    const menuConnectId = ref('home-menu-connect');
    const kk = reactive({
      tt: { a: 2 }
    });
    (window as any)['ee'] = kk;
    return {
      menus, goto, personOutline, homeOutline, menuConnectId, kk
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
</style>