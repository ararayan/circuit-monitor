<template>
  <!-- v-bing support dyanmic pass all props to child -->
  <component :is="entityComponent" v-bind="props"></component>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue';
import { EntityViewType, getViewNameByEntityName } from '@/share/entity';
import { useEntityContext } from '@/share';

export default defineComponent({
  name: 'EntityView',
  components: {},
  setup(props) {
    const { entityName, recordId } = useEntityContext();
    const type = recordId === undefined || recordId === '' ? EntityViewType.Browse : EntityViewType.Edit;
    const viewName = getViewNameByEntityName(entityName, type);
    const entityComponent = defineAsyncComponent(() =>
      import(`@/views/${viewName}.vue`)
    );
    return {
      entityComponent,
      props
    };
  }
});
</script>
