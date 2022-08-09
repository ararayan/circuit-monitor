<template>
    <div class="cs-tablist">
        <div class="cs-tab-item ripple-parent ion-activatable" lines="none" color="light"
            :class="{ 'cs-tab-item-selected': tab.selected }" v-for="tab in tabs" :key="tab.id"
            @click="$emit('gotoTab', tab.id)">
            <ion-icon :icon="tabsIconMap[tab.id]" size="small" slot="start"
                class="cs-tab-icon"></ion-icon>
            <ion-label class="cs-tab-label">{{ tab.displayName }}</ion-label>
            <ion-ripple-effect></ion-ripple-effect>
        </div>
    </div>

</template>

<script lang="ts">
import { EntityTabInfo, MixedModuleType } from '@/share/entity';
import { IonIcon, IonLabel, IonRippleEffect } from '@ionic/vue';
import { toRefs } from '@vue/reactivity';
import { pulseOutline, radioOutline, scaleOutline } from 'ionicons/icons';
import { defineComponent, PropType, watch } from 'vue';


export default defineComponent({
  name: 'EntityTab',
  components: {
    IonLabel, IonIcon, IonRippleEffect,
  },
  props: {
    tabList: { type: Array as PropType<EntityTabInfo[]>, required: true }
  },
  emits: ['gotoTab'],
  setup(props,  { emit }) {
    const { tabList: tabs } = toRefs(props);
    const tabsIconMap = {
      [MixedModuleType.Yx]: radioOutline,
      [MixedModuleType.Yc]: scaleOutline,
      [MixedModuleType.Ym]: pulseOutline,
    };
    watch(tabs, () => {
      const selectedTab = tabs.value.find(tab => tab.selected);
      emit('gotoTab', selectedTab?.id);
    }, {immediate: true});

    return { tabs, tabsIconMap, scaleOutline, pulseOutline, radioOutline, };
  },
});
</script>

<style>
.cs-tablist {
    display: flex;
    justify-content: space-between;
    padding-top: 0;
    padding-bottom: 0;
    height: 48px;
    align-items: stretch;
    background: var(--ion-color-light);


}

.cs-tab-item {
    flex: 1 1 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 3px solid var(--ion-color-light);
    position: relative;
}

.cs-tab-item-selected {
    border-bottom: 3px solid var(--ion-color-success-shade);
}

.cs-tab-icon {
    margin-left: -0.5em;
    margin-right: 0.3em;
}

.cs-tab-item-selected>.cs-tab-icon {
    color: var(--ion-color-primary-shade);
}

.cs-tab-item-selected>.cs-tab-label {
    color: var(--ion-color-primary-shade);
}

</style>
