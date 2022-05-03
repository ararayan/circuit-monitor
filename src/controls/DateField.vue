<template>
  <ion-item :lines="['input', 'textarea'].includes(attrField.type) ? undefined : 'none'" >
    <ion-label :for="attrField.id">{{ attrField.label }}</ion-label>
<ion-input :readonly='attrField.readonly' :disabled="attrField.disabled" type="date"
        :value="attrField.value" :name="attrField.name" :id="attrField.id"
        @update:modelValue="change(attrField, $event)"></ion-input>
  </ion-item>
</template>

<script lang="ts">
import { Entities, FormField } from '@/share/entity';
import { IonInput, IonItem, IonLabel } from '@ionic/vue';
import { toRefs } from '@vue/reactivity';
import { defineComponent, PropType } from 'vue';
import { useVeeField } from './useVeeField';



export default defineComponent({
  name: 'DateField',
  components: { IonInput, IonItem, IonLabel },
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