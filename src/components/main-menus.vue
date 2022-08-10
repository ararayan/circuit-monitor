<template>
  <ion-menu side="start" :content-id="menuId" style="--side-max-width: 400px">
    <ion-header lines="none" class="ion-padding-top">
      <ion-toolbar translucent padding class="drawer-header-toolbar">
        <!-- <ion-title size="large" class="drawer-header-title">衍能科技</ion-title> -->
      </ion-toolbar>
      <ion-list>
        <ion-list-header>
          <ion-item class="drawer-header-userinfo ion-margin-bottom" lines="none">
            <ion-avatar slot="start">
              <ion-img src="assets/user/avatar_1.svg"></ion-img>
            </ion-avatar>
            <ion-label>
              <h3>{{user.userName}}</h3>
              <p>{{user.email}}</p>
            </ion-label>
          </ion-item>
        </ion-list-header>
      </ion-list>
    </ion-header>
    <ion-content style="--ion-background-color: transparent" color="light">

      <ion-list color="light">
        <ion-item color="light" @click="gotoHome()" class="ion-activatable ripple-parent main-menu-item">
          <ion-icon :icon="homeOutline" class="menu-item-icon" color="primary" slot="start"></ion-icon>
          <ion-label class="menu-item-text">首页</ion-label>
          <ion-ripple-effect></ion-ripple-effect>

        </ion-item>
        <ion-item color="light" @click="gotoUser()" class="ion-activatable ripple-parent main-menu-item">
          <ion-icon :icon="settingsOutline" class="menu-item-icon" color="primary" slot="start"></ion-icon>
          <ion-label>修改密码</ion-label>
          <ion-ripple-effect></ion-ripple-effect>
        </ion-item>
        <ion-item color="light" @click="gotoAbout()" class="ion-activatable ripple-parent main-menu-item">
          <ion-icon :icon="bookOutline" class="menu-item-icon" color="primary" slot="start"></ion-icon>
          <ion-label>关于</ion-label>
          <ion-ripple-effect></ion-ripple-effect>
        </ion-item>
        <ion-item color="light" class="ion-activatable ripple-parent main-menu-item">
          <ion-icon :icon="colorFilterOutline" class="menu-item-icon" color="primary" slot="start"></ion-icon>
          <ion-label>版本检查</ion-label>
          <ion-ripple-effect></ion-ripple-effect>
        </ion-item>
        <ion-item>
          <ion-label>是否推送通知</ion-label>
          <ion-toggle slot="end" name="grape" color="tertiary" checked></ion-toggle>
        </ion-item>

      </ion-list>
      <!-- <ion-accordion-group>
        <ion-accordion value="colors">
          <ion-item slot="header" class="menu-item">
            <ion-icon :icon="settingsOutline" class="menu-item-icon"></ion-icon>
            <ion-label class="menu-item-text">设置</ion-label>
          </ion-item>

          <ion-list slot="content">
            <ion-item>
              <ion-label>设置 1</ion-label>
              <ion-toggle slot="end" name="grape" color="tertiary" checked></ion-toggle>
            </ion-item>

            <ion-item>
              <ion-label>设置 2</ion-label>
              <ion-toggle slot="end" name="kiwi" color="success" checked></ion-toggle>
            </ion-item>

            <ion-item>
              <ion-label>设置 3</ion-label>
              <ion-toggle slot="end" name="banana" color="warning" checked></ion-toggle>
            </ion-item>

            <ion-item>
              <ion-label>设置 4</ion-label>
              <ion-toggle slot="end" name="cherry" color="danger" checked></ion-toggle>
            </ion-item>


          </ion-list>
        </ion-accordion>
      </ion-accordion-group> -->

    </ion-content>

  </ion-menu>
</template>
<script lang="ts">
import { defineComponent, } from 'vue';
import { toRef } from '@vue/reactivity';
import {
  IonHeader, IonListHeader,
  IonToolbar, IonContent, IonLabel, IonMenu, IonList, IonItem, IonImg, IonAvatar, IonIcon, IonRippleEffect, IonToggle,
} from '@ionic/vue';
import { settingsOutline, homeOutline, bookOutline, colorFilterOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/share/user';
import { storeToRefs } from 'pinia';

export default defineComponent({
  name: 'MainMenus',
  components: {
    IonHeader, IonToolbar,
    IonContent, IonListHeader,
    IonLabel, IonMenu, IonList, IonItem, IonImg, IonAvatar, IonIcon, IonRippleEffect, IonToggle,
  },
  props: {
    contentId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter();
    const userStore = useUserStore();
    const { user } = storeToRefs(userStore);
    const menuId = toRef(props, 'contentId');
    const gotoHome = () => {
      router.push('/home');
    };
    const gotoUser = () => {
      router.push('/user');
    };
    const gotoAbout = () => {
      router.push('/about');
    };

    return { user, menuId, settingsOutline, homeOutline, bookOutline, gotoHome, gotoUser, gotoAbout, colorFilterOutline };
  }
});
</script>
<style>
.drawer-header-toolbar {
  background-image: url("~/public/assets/yanneng.jpg");
  background-position: center;
  background-size: cover;
  padding-top: 1em;
  --background: transparent;
  height: 11.25em;
  /*180px*/
}

.drawer-header-title {
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  color: rgba(255, 255, 255, 0.808);
}

.drawer-header-userinfo {
  --background: transparent;
  background-color: rgba(255, 255, 255, 0.5);
}

.menu-item-icon {
  margin-right: 0.5em;
}

.main-menu-item {
  /* --padding-start: 0; */
  --border-color: var(--ion-color-light, #f2f2f2);
}
</style>
