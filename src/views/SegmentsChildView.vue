/* eslint-disable vue/no-unused-components */
<template>
    <ion-page mode="md">
         <ion-header translucent>
          <ion-toolbar color="primary">
            <ion-buttons slot="start">
                <ion-back-button default-href="/home" @click="backTo()"></ion-back-button>
            </ion-buttons>
            <ion-title center>{{ title }}</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list :class="{ 'ion-hide': !!!records.length }">
              <ion-item v-for="item in records" :key="item.id" class="entity-list-item" >
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
          <!-- <ion-list class="cs-tablist">
            <ion-item  class="cs-tab-item ripple-parent ion-activatable"  lines="none"  color="light" :class="{'cs-tab-item-selected': tab.selected}"
            v-for="tab in tabs" :key="tab.id" @click="gotoTab(tab)" >
             <ion-ripple-effect ></ion-ripple-effect>
             <ion-icon :icon="tab.id == 't1' ? radioOutline : tab.id == 't2' ? scaleOutline : pulseOutline" size="small" class="cs-tab-icon"></ion-icon>
             <ion-label class="cs-tab-label">{{ tab.displayName }}</ion-label>
            </ion-item>
          </ion-list> -->

          <entity-tab :tabList="tabs" @goto-tab="gotoTab($event)"></entity-tab>
        </ion-footer>
    </ion-page>
</template>

<script lang="ts">
import EntityTab from '@/components/EntityTab.vue';
import { getMatchedEntityInfoByRoute } from '@/share';
import { getEntityStore } from '@/share/entity';
import { useUserStore } from '@/share/user';
import { IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonLabel, IonPage, IonRippleEffect, IonSkeletonText, IonThumbnail, IonTitle, IonToolbar } from '@ionic/vue';
import { computed } from '@vue/reactivity';
import { storeToRefs } from 'pinia';
import { defineComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'SegmentsChildView',
  // eslint-disable-next-line vue/no-unused-components
  components: { IonPage, IonLabel, IonIcon, IonThumbnail, IonSkeletonText, IonButton, IonFooter, IonRippleEffect, EntityTab,
    IonContent, IonToolbar, IonTitle, IonButtons, IonHeader,IonBackButton },
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
    return { tabs, title, backTo, records, gotoTab, skeletonSize};
  },
});
</script>

<style>
/* .cs-tablist {
  display: flex;
  justify-content: space-between;
  padding-top: 0;
  padding-bottom: 0;
}
.cs-tab-item {
  flex: 1 1 50%; 
  --padding-start: 0;
  border-bottom: 3px solid var(--ion-color-light);
}
.cs-tab-item-selected{
  border-bottom: 3px solid var(--ion-color-success-shade);
}

.cs-tab-icon {
  margin-left: 20px; margin-right: 0.3em;
}
.cs-tab-item-selected > .cs-tab-icon {
  color: var(--ion-color-primary-shade);
}

.cs-tab-item-selected > .cs-tab-label {
color: var(--ion-color-primary-shade);
} */

.entity-list-item {
  --border-color: var(--ion-color-light, #f2f2f2);
}
</style>
