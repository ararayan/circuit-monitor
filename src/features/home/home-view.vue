<template>
  <ion-page>
    <ion-header>
        <ion-toolbar>
          <ion-title>Yan Neng</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content :fullscreen="true">
        <ion-grid>
          <ion-row>
            <template v-for="item in menus" :key="item.id">
              <ion-col size="6" size-sm="6">
                <div class="gridcard ion-activatable ripple-parent" @click="goto(item.entryPath)">
                  <ion-icon :icon="item.icon" color="primary" class="gridcard-icon"></ion-icon>
                  <ion-label class="gridcard-text">{{ item.name }}</ion-label>
                  <ion-ripple-effect></ion-ripple-effect>
                </div>
              </ion-col>
            </template>
          </ion-row>
        </ion-grid>
      </ion-content>

    <div v-show="childPageVisible">
      <ion-router-outlet></ion-router-outlet>
    </div>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter, onBeforeRouteUpdate } from 'vue-router';
import {
  IonPage, IonHeader, IonGrid, IonRow, IonCol,
  IonToolbar, IonTitle, IonContent, IonIcon, IonLabel, IonRippleEffect, IonRouterOutlet
} from '@ionic/vue';
import { userStore } from './user.store';
import { storeToRefs } from 'pinia';


export default defineComponent({
  name: 'HomeView',
  components: {
    IonHeader, IonToolbar,
    IonTitle, IonContent, IonPage, IonIcon, IonGrid, IonRow, IonCol,
    IonLabel, IonRippleEffect, IonRouterOutlet
  },
  setup() {
    debugger;
    const user = userStore();
    user.getUserMenu();
    const {menus} = storeToRefs(user);

    let childPageVisible = ref(false);
    const router = useRouter();
    function goto(path: string) {
      router.push(path);
    }
    (window as any).tt = router;
    // const route = useRoute();
    // watch(route, (to, from) => {});
    // onBeforeRouteLeave((to, from) => {})
    onBeforeRouteUpdate(async (to) => {
      childPageVisible.value = !!to.meta.isHomeChildren;
    });
 
    return {
      menus, goto, childPageVisible
    };
  },
});
</script>
<style>
.gridcard {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 8em;
  background-color: #f4f4f4;
  border-radius: 8px;
  border: 1px solid red;
}
.gridcard-icon {
  font-size: 4em;
}
</style>