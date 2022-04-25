<template>
    <ion-page>
         <ion-header translucent>
          <ion-toolbar mode="md" color="primary">
            <ion-buttons slot="start">
                <ion-back-button default-href="/home" @click="backTo()"></ion-back-button>
            </ion-buttons>
            <ion-title center>{{ title }}</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
              <ion-item v-for="item in records" :key="item.id" >
                <ion-label>
                    <h2>{{ item.displayName }}</h2>
                     <p>{{ item.colC }}</p>
                    <h3>{{ item.colA }}</h3>
                    <p>{{ item.colB }}</p>
                </ion-label>
                <ion-icon  slot="end" color="medium"></ion-icon>
            </ion-item>
          </ion-list>
        </ion-content>
        <ion-footer>
          <ion-list style="display: flex; justify-content: space-between;">
            <ion-item lines="none" style="flex: 1 1 50%;" v-for="tab in tabs" :key="tab.id">
              <ion-button @click="gotoTab(tab)" style="width: 100%; height: 100%;" type="submit" size="large" fill="clear" :color="tab.selected ? 'primary' : 'medium'">{{ tab.displayName }}</ion-button>
            </ion-item>
          </ion-list>
        </ion-footer>
    </ion-page>
</template>

<script lang="ts">
import { getMatchedEntityInfoByRoute } from '@/share';
import { Entities, getEntityStore } from '@/share/entity';
import { useUserStore } from '@/share/user';
import { IonPage, IonFooter, IonButton, IonIcon,
  IonLabel, IonList, IonItem, IonContent, IonTitle, IonToolbar,IonButtons, IonHeader, IonBackButton } from '@ionic/vue';
import { computed } from '@vue/reactivity';
import { storeToRefs } from 'pinia';
import { defineComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';


export default defineComponent({
  name: 'RealtimeView',
  components: { IonPage, IonButton, IonLabel, IonIcon,
    IonFooter, IonList, IonItem, IonContent, IonToolbar, IonTitle, IonButtons, IonHeader,IonBackButton },
  props: {
    tab: { type: String, required: false, default: 't1'}
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const { entityName } = getMatchedEntityInfoByRoute(route);
    const entityStore = getEntityStore(entityName);
    entityStore.initEntityTabs(entityName);
    const { entityTabs, records } = storeToRefs(entityStore);
    entityStore.getRecords(entityName, {tabId: props.tab});
    const tabs = computed(() => {
      if(props.tab) {
        return entityTabs.value.map(x => {
          if (x.id === props.tab) {
            x.selected = true;
          }else {
            x.selected = false;
          }
          return x;
        });
      }
      return entityTabs.value;
    });
    const userStore = useUserStore();
    const { menus }  = storeToRefs(userStore);
    const title = computed(() => {
      return menus.value.find(item => item.id === entityName)?.name || '';
    });
    function backTo() {
      router.push('/home');
    }

    function gotoTab(tab: any) {
      router.replace({ query:  {tab: tab.id } });
   
    }
    return { tabs, title, backTo, records, gotoTab };
  },
});
</script>
