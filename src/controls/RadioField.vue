<template>
  <ion-label :for="attrField.id">{{ attrField.label }}</ion-label>
 <ion-radio slot="start" color="success" :value="attrField.value" :name="attrField.name"
        @update:modelValue="change(attrField, $event)"></ion-radio>
</template>

<script lang="ts">
import { Entities, FormField } from '@/share/entity';
import { IonRadio, IonLabel } from '@ionic/vue';
import { toRefs } from '@vue/reactivity';
import { defineComponent, PropType } from 'vue';
import { useVeeField } from './useVeeField';



export default defineComponent({
  name: 'RadioField',
  components: { IonRadio, IonLabel },
  props: {
    entityName: { type: String as PropType<Entities>, required: true },
    field: { type: Object as PropType<FormField>, required: true },
    labelPosition: { type: String, required: false, default: 'fixed' }
  },
  setup(props) {
    const { field: attrField } = toRefs(props);
    const { change } = useVeeField(attrField, props.entityName);

    return {
      attrField,
      change,
    };
  },
});
</script>