<template>
  <ion-page>
    <ion-content>
        <ion-grid>
          <ion-row color="primary">
            <ion-col size="12" size-sm="12">
              <div>
                <h3>Login</h3>
              </div>
              <div>
                <ion-item>
                  <ion-input name="name" type="text" placeholder="Name" v-model="form.userName"></ion-input>
                </ion-item>
                <ion-item>
                  <ion-input name="password" type="password" placeholder="Password"  v-model="form.password"></ion-input>
                </ion-item>
              </div>
              <div>
                <ion-button size="large" type="submit" expand="block" @click="login()">Register</ion-button>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
    </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onUnmounted, reactive } from 'vue';
import { IonPage, IonContent, IonGrid, IonRow, IonCol, IonItem, IonInput, IonButton } from '@ionic/vue';
import { userStore } from './user.store';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'LoginView',
  components: { IonPage, IonContent, IonGrid, IonRow, IonCol, IonItem, IonInput, IonButton },
  setup() {
    const user = userStore();
    const router = useRouter();
    const form = reactive({
      userName: '',
      password: 123456
    });
    function login() {
      const data = {...form};
      user.login(data);
      
    } 
    user.$subscribe((mutation, state) => {
      if (state.status.isAuth) {
        router.push('/home');
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onBeforeUnmount(() => { });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onUnmounted(() => { });
    return {
      form,
      login
    };
  },
});
</script>