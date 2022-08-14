<template>
  <ion-app>
     <ion-router-outlet></ion-router-outlet>
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent } from 'vue';
// import { useRoute } from 'vue-router';
// import { useBackButton } from '@ionic/vue';
// import { App } from '@capacitor/app';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet,
  },  
  // beforeCreate(() => {}),
  setup() {
    // const route = useRoute();
    // const dispose = useBackButton(-1, (next) => {
    //   if (route.path.includes('/home') || route.path.includes('/login')) {
    //     App.exitApp();
    //   }else {
    //     next();
    //   }
    // });
    // onUnmounted(() => {
    //   dispose.unregister();
    // });
  }
  // async created() {
  //   return Promise.resolve(true).then(() => {
  //     // debugger;
  //   });
  // },
});
</script>
