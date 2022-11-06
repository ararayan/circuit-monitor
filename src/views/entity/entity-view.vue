<template>
  <!-- v-bing support dyanmic pass all props to child -->
  <component :is="entityComponent" v-bind="props" ref="instance"></component>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, ref } from 'vue';
import { EntityViewType, getViewNameByEntityName } from '@/share/entity';
import { useEntityContext } from '@/share';
import { onIonViewDidEnter, onIonViewDidLeave } from '@ionic/vue';

export default defineComponent({
  name: 'EntityView',
  components: {},
  setup(props) {
    const { entityName, recordId } = useEntityContext();
    const type = recordId === undefined || recordId === '' ? EntityViewType.Browse : EntityViewType.Detail;
    const viewName = getViewNameByEntityName(entityName, type);
    const instance = ref<null>(null);
    const entityComponent = defineAsyncComponent(() =>
      import(`@/views/entity/${viewName}.vue`)
    );
     
    onIonViewDidEnter(() => {
      const hooks = instance.value?.['onIonViewDidEnter'] || [] as Array<() => void>;
      hooks.forEach(hook => hook?.());
    });
    onIonViewDidLeave(() => {
      const hooks = instance.value?.['onIonViewDidLeave'] || [] as Array<() => void>;
      hooks.forEach(hook => hook?.());
    });
    return {
      entityComponent,
      props,
      instance
    };
  }
});
</script>
