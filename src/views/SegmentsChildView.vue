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
          <ion-list :class="{ 'ion-hide': !!!records.length }">
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
                <ion-list :class="{ 'ion-hide': !!records.length }">
        <ion-item v-for="(item, index) in skeletonSize" :key="index">
          <ion-thumbnail slot="start">
            <ion-skeleton-text></ion-skeleton-text>
          </ion-thumbnail>
          <ion-label>
            <h3>
              <ion-skeleton-text animated style="width: 80%"></ion-skeleton-text>
            </h3>
            <p>
              <ion-skeleton-text animated style="width: 60%"></ion-skeleton-text>
            </p>
            <p>
              <ion-skeleton-text animated style="width: 30%"></ion-skeleton-text>
            </p>
          </ion-label>
        </ion-item>
      </ion-list>
        </ion-content>
        <ion-footer>
          <ion-list style="display: flex; justify-content: space-between;">
            <ion-item lines="none" style="flex: 1 1 50%;" v-for="tab in tabs" :key="tab.id">
          
              <ion-button @click="gotoTab(tab)" :class="{'tab-btn-selected': tab.selected}" style="width: 100%; height: 100%;" type="submit" size="large" fill="clear" :color="tab.selected ? 'primary' : 'medium'">
                <ion-icon :icon="tab.id == 't1' ? radioOutline : tab.id == 't2' ? scaleOutline : pulseOutline" size="small" solt="start"></ion-icon>
                <ion-label style="margin-left: 0.3em;">{{ tab.displayName }}</ion-label> 
              </ion-button>
            </ion-item>
          </ion-list>
        </ion-footer>
    </ion-page>
</template>

<script lang="ts">
import { getMatchedEntityInfoByRoute } from '@/share';
import { Entities, getEntityStore } from '@/share/entity';
import { useUserStore } from '@/share/user';
import { IonPage, IonFooter, IonButton, IonIcon, IonThumbnail, IonSkeletonText,
  IonLabel, IonList, IonItem, IonContent, IonTitle, IonToolbar,IonButtons, IonHeader, IonBackButton, } from '@ionic/vue';
import { computed } from '@vue/reactivity';
import { storeToRefs } from 'pinia';
import { defineComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { scaleOutline, pulseOutline, radioOutline } from 'ionicons/icons';

export default defineComponent({
  name: 'SegmentsChildView',
  components: { IonPage, IonLabel, IonIcon, IonThumbnail, IonSkeletonText, IonButton, IonFooter,
    IonList, IonItem, IonContent, IonToolbar, IonTitle, IonButtons, IonHeader,IonBackButton },
  props: {
    tab: { type: String, required: false, default: 't1'}
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const { entityName, parentEntityName } = getMatchedEntityInfoByRoute(route);
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
      return menus.value.find(item => item.id === parentEntityName)?.name || '';
    });
    function backTo() {
      if (parentEntityName) {
        router.push({path: `/entity/${parentEntityName}`});
      }else {
        router.back();
      }
      
    }

    function gotoTab(tab: any) {
      router.replace({ query:  {tab: tab.id } });
   
    }

    const skeletonSize: string[] = Array.from({length: 12});
    return { tabs, title, backTo, records, gotoTab, scaleOutline, pulseOutline, radioOutline, skeletonSize};
  },
});
</script>

<style>
.tab-btn-selected{
  border-bottom: 3px solid;
}
</style>
