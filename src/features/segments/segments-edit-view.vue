<template>
  <ion-page class="segmentsview_edit">
    Segments Edit View
  </ion-page>
</template>

<script lang="ts">
// import { createEntityStore } from '@/share/entity';
import { IonPage,  } from '@ionic/vue';
// import { storeToRefs } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SegmentsEditView', // 分隔图tab
  components: {
    IonPage,
  },
  setup() {
    debugger;
    // const store = createEntityStore('segments');
    // store.getRecords();
    // const { records } = storeToRefs(store);
    return {};
  }
});
</script>
