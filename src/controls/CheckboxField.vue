<template>
  <ion-item :lines="['input', 'textarea'].includes(attrField.type) ? undefined : 'none'" >
    <ion-label :for="attrField.id">{{ attrField.label }}</ion-label>
      <ion-checkbox slot="start" @update:modelValue="change(attrField, $event)" :value="attrField.value"
        :readonly='attrField.readonly' :disabled="attrField.disabled" :name="attrField.name">
      </ion-checkbox>
  </ion-item>
</template>

<script lang="ts">
import { Entities, FormField } from '@/share/entity';
import { IonCheckbox, IonItem, IonLabel } from '@ionic/vue';
import { toRefs } from '@vue/reactivity';
import { defineComponent, PropType } from 'vue';
import { useVeeField } from './useVeeField';



export default defineComponent({
  name: 'CheckboxField',
  components: { IonCheckbox, IonItem, IonLabel },
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
