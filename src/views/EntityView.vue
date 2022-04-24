<template>
<!-- v-bing support dyanmic pass all props to child -->
 <component :is="entityComponent" v-bind="props"></component>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import { computed }  from '@vue/reactivity';
import { EntityViewType, getViewNameByEntityName } from '@/share/entity';

export default defineComponent({
  name: 'EntityView',
  components: {},
  props: {
    tab: { type: String, required: false}
  },
  setup(props) {
    const route = useRoute();
    const entityComponent = computed(()=> {
      const entityName = route.params?.entityName as string;
      const recordId = route.params?.recordId as string;
      const type = recordId === '' ? EntityViewType.Browse : EntityViewType.Edit;
      const viewName = getViewNameByEntityName(entityName, type);
      return defineAsyncComponent(() =>
        import(`@/views/${viewName}.vue`)
      );
    });
    return {
      entityComponent,
      props
    };
  }
});
</script>
