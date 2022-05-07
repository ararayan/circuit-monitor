<template>
  <ion-page>
    <ion-content class="linear-blue">

      <ion-card >
        <ion-card-header>
          <ion-card-title style="text-align: center; --color: #fff"></ion-card-title>
        </ion-card-header>


        <ion-card-content>
          <ion-item lines="none">
            <ion-img src="assets/yanneng.jpg" style="height: 30vh; min-height: 200px; margin: 0 auto;"></ion-img>
          </ion-item>
          <ion-item style="background: #fff" class="ion-padding-horizontal">
            <ion-label position="floating">
              <ion-icon size="large" color="medium" :icon="personCircleOutline" slot="start"
                style="vertical-align: bottom; margin-right: 0.25em"></ion-icon>
              <ion-note color="medium">用户名</ion-note>
            </ion-label>
            <ion-input name="name" type="text" v-model="form.userName"></ion-input>
          </ion-item>
          <ion-item style="background: #fff" class="ion-padding-horizontal ion-margin-bottom">
            <ion-label position="floating">
              <ion-icon size="large" color="medium" :icon="lockClosedOutline" slot="start"
                style="vertical-align: bottom; margin-right: 0.25em"></ion-icon>
              <ion-note color="medium">密码</ion-note>
            </ion-label>
            <ion-input name="password" type="password" v-model="form.password"></ion-input>
          </ion-item>
          <ion-button size="large" type="submit" expand="block" @click="login()" class="ion-margin">
            <ion-label>登陆</ion-label>
            <ion-icon slot="end" :icon="arrowForwardCircleOutline"></ion-icon>
          </ion-button>

        </ion-card-content>
      </ion-card>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onUnmounted, reactive } from 'vue';
import {
  IonPage, IonContent, IonItem, IonInput, IonButton, IonImg,
  IonLabel, IonIcon, IonCard, IonCardHeader, IonNote,
  IonCardContent, IonCardTitle
} from '@ionic/vue';
import { useUserStore } from '@/share/user';
import { useRouter } from 'vue-router';
import { personCircleOutline, lockClosedOutline, arrowForwardCircleOutline } from 'ionicons/icons';

export default defineComponent({
  name: 'LoginView',
  components: {
    IonPage, IonContent, IonItem, IonInput, IonButton, IonLabel, IonIcon, IonCardTitle, IonNote, IonImg,
    IonCard, IonCardHeader, IonCardContent
  },
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const form = reactive({
      userName: '',
      password: ''
    });
    function login() {
      const data = { ...form };
      userStore.login(data);

    }
    userStore.$subscribe((mutation, state) => {
      if (state.isAuth) {
        router.replace('/home');
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onBeforeUnmount(() => { });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onUnmounted(() => { });
    return {
      form,
      login,
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
</style>