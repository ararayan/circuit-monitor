<template>
  <ion-page mode="md">
    <template v-if="enterBaseURLInited">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title center>API Config</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content fullscreen class="ion-padding">
        <ion-list>
          <ion-item lines="none">
            <ion-label for="apiUrl" size="large">API Default Base URL:</ion-label>
          </ion-item>
          <ion-item>
            <ion-input type="text" v-model="apiBaseURL" name="apiUrl" id="apiUrl"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label >Enable App Debug</ion-label>
            <ion-checkbox slot="start" color="success" v-model="enableAppDebug"></ion-checkbox>
          </ion-item>
          <ion-item lines="none" style="padding: 4em 1em;">
            <ion-button style="min-width: 25vw; margin: auto; position: relative; left: 25%;" size="medium"
              color="success" @click="initAppBaseurl()">
              <ion-icon :icon="locateOutline" slot="start"></ion-icon>
              <ion-label>ok</ion-label>
            </ion-button>
          </ion-item>
        </ion-list>
      </ion-content>
      <!-- <ion-footer  >
      <ion-list>        <ion-item lines="none" style="positon: absolute; bottom: 0">
          <ion-button style="min-width: 25vw;" size="medium" color="success">
            <ion-icon :icon="locateOutline" slot="start"></ion-icon>
            <ion-label>ok</ion-label>
          </ion-button>
        </ion-item></ion-list>

      </ion-footer> -->
    </template>
    <template v-if="!enterBaseURLInited">
      <ion-content mode="md" class="linear-blue">
        <ion-card>
          <ion-card-header>
            <ion-card-title style="text-align: right; ">
              <ion-button @click="resetBaseUrl()" color="light">
                <ion-icon :icon="settingsOutline"></ion-icon>
              </ion-button>
            </ion-card-title>

          </ion-card-header>

    
            <ion-card-content class="login-card">
              <ion-item lines="none">
                <ion-img src="assets/yanneng.jpg" style="height: 30vh; min-height: 200px; margin: 0 auto;"></ion-img>
              </ion-item>
              <ion-item style="background: #fff" class="ion-padding-horizontal" :class="{ 'ion-invalid': loginError }">
                <ion-label position="floating">
                  <ion-icon size="large" color="medium" :icon="personCircleOutline" slot="start"
                    style="vertical-align: bottom; margin-right: 0.25em"></ion-icon>
                  <ion-note color="medium">用户名</ion-note>
                </ion-label>
                <ion-input name="name" type="text" v-model="form.loginUserName" @change="onUserInfoChanged()">
                </ion-input>
              </ion-item>
              <ion-item style="background: #fff" class="ion-padding-horizontal ion-margin-bottom"
                :class="{ 'ion-invalid': loginError }">
                <ion-label position="floating">
                  <ion-icon size="large" color="medium" :icon="lockClosedOutline" slot="start"
                    style="vertical-align: bottom; margin-right: 0.25em"></ion-icon>
                  <ion-note color="medium">密码</ion-note>
                </ion-label>
                <ion-input name="password" type="password" v-model="form.password" @change="onUserInfoChanged()">
                </ion-input>
              </ion-item>
              <ion-item style="background: #fff" class="ion-padding-horizontal" lines="none">
                <ion-label for="test1">记住密码</ion-label>
                <ion-checkbox slot="start" v-model="form.remenberPassword" id="test1">
                </ion-checkbox>
              </ion-item>
              <ion-button size="large" type="submit" expand="block" @click="login($event)" class="ion-margin">
                <ion-label>登陆</ion-label>
                <ion-icon slot="end" :icon="arrowForwardCircleOutline"></ion-icon>
              </ion-button>

              <ion-item style="background: #fff" class="ion-padding-horizontal" lines="none" v-if="loginError">
                <ion-label color="danger">{{ loginErrorMsg }}</ion-label>
              </ion-item>
            </ion-card-content>
  

        </ion-card>

      </ion-content>
    </template>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onUnmounted, ref } from 'vue';
import {
  IonPage, IonContent, IonItem, IonInput, IonButton, IonImg,
  IonLabel, IonIcon, IonCard, IonCardHeader, IonNote, IonCheckbox,
  IonCardContent, IonCardTitle, IonHeader, IonList, IonTitle, IonToolbar, useIonRouter
} from '@ionic/vue';
import { useUserStore } from '@/share/user';

import { personCircleOutline, lockClosedOutline, arrowForwardCircleOutline, locateOutline, settingsOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/share/hooks/use-app.store';
// import axios from 'axios';
// import { alertController } from '@ionic/core';

export default defineComponent({
  name: 'LoginView',
  components: {
    IonPage, IonContent, IonItem, IonInput, IonButton, IonLabel, IonIcon, IonCardTitle, IonNote, IonImg, IonHeader,
    IonCard, IonCardHeader, IonCardContent, IonCheckbox, IonList, IonTitle, IonToolbar,
  },
  setup() {
    const userStore = useUserStore();
    const appStore = useAppStore();
    const { enterBaseURLInited, debug } = storeToRefs(appStore);
    const apiBaseURL = ref<string>(appStore.baseUrl);
    const enableAppDebug = ref<boolean>(debug.value);
    const { user: form, loginErrorMsg, loginError } = storeToRefs(userStore);
    const router = useIonRouter();
    function login(event: PointerEvent | any) {
      event.preventDefault();
      const data = {
        userName: form.value.loginUserName,
        password: form.value.password,
        remenberPassword: form.value.remenberPassword,
      };
      userStore.login(data);

    }
    userStore.$subscribe((mutation, state) => {
      if (state.isAuth) {
        router.replace('/home');
      }
    });
    function onUserInfoChanged() {
      if (loginError) {
        userStore.emptyLoginErrorMsg();
      }
    }
    function initAppBaseurl() {
      appStore.setBaseUrl(apiBaseURL.value);
      appStore.setDebugMode(enableAppDebug.value);
    }
    function resetBaseUrl() {
      if (loginError) {
        userStore.emptyLoginErrorMsg();
      }
      appStore.setBaseUrl('');
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onBeforeUnmount(() => { });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onUnmounted(() => { });

    // function publicApi() {
    //   axios.create().post('http://jsonplaceholder.typicode.com/posts').then(response => {
    //     const alter = alertController.create({
    //       message: JSON.stringify(response.data)
    //     });
    //     alter.then(x => x.present());
    //   }).catch(() => {
    //     const alter = alertController.create({
    //       message: `can't access to network`
    //     });
    //     alter.then(x => x.present());
    //   });
    // }

    return {
      // publicApi,
      locateOutline, enterBaseURLInited, apiBaseURL, initAppBaseurl, settingsOutline, resetBaseUrl, enableAppDebug,
      form,
      login,
      onUserInfoChanged,
      loginError,
      loginErrorMsg,
      personCircleOutline,
      arrowForwardCircleOutline,
      lockClosedOutline,
    };
  },
});
</script>
<style>
.linear-blue {
  --background: transparent;
  background-image: linear-gradient(45deg, rgba(8, 211, 172, 0.45) 0%, rgba(8, 211, 172, 0.45) 12.5%, rgba(62, 29, 50, 0.45) 12.5%, rgba(62, 29, 50, 0.45) 25%, rgba(54, 55, 67, 0.45) 25%, rgba(54, 55, 67, 0.45) 37.5%, rgba(47, 81, 85, 0.45) 37.5%, rgba(47, 81, 85, 0.45) 50%, rgba(23, 159, 137, 0.45) 50%, rgba(23, 159, 137, 0.45) 62.5%, rgba(16, 185, 155, 0.45) 62.5%, rgba(16, 185, 155, 0.45) 75%, rgba(31, 133, 120, 0.45) 75%, rgba(31, 133, 120, 0.45) 87.5%, rgba(39, 107, 102, 0.45) 87.5%, rgba(39, 107, 102, 0.45) 100%), linear-gradient(135deg, rgb(87, 116, 221), rgb(35, 4, 229));
}

.gb-blue {
  background-image: linear-gradient(135deg, rgb(13, 4, 178) 0%, rgb(13, 4, 178) 12.5%, rgb(17, 25, 182) 12.5%, rgb(17, 25, 182) 25%, rgb(20, 46, 185) 25%, rgb(20, 46, 185) 37.5%, rgb(24, 67, 189) 37.5%, rgb(24, 67, 189) 50%, rgb(28, 87, 192) 50%, rgb(28, 87, 192) 62.5%, rgb(32, 108, 196) 62.5%, rgb(32, 108, 196) 75%, rgb(35, 129, 199) 75%, rgb(35, 129, 199) 87.5%, rgb(39, 150, 203) 87.5%, rgb(39, 150, 203) 100%);
}

.login-card .item-has-value .label-floating.sc-ion-label-md-h {
  transform: translateY(30%) scale(0.75);
}
</style>
