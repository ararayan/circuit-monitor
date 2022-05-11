<template>
  <ion-item :lines="attrField.layout?.fieldLines" >
    <ion-label :for="attrField.id" :position="attrField.layout?.labelPosition">{{ attrField.label }}</ion-label>
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
import { UpdateValueEventName, useVeeField } from './useVeeField';



export default defineComponent({
  name: 'CheckboxField',
  components: { IonCheckbox, IonItem, IonLabel },
  props: {
    formName: { type: String as PropType<Entities | string>, required: true },
    field: { type: Object as PropType<FormField>, required: true },
  },
  emits: [UpdateValueEventName],
  setup(props, {emit}) {
    const { field: attrField } = toRefs(props);
    const { change } = useVeeField(attrField, props.formName, emit);

    return {
      attrField,
      change,
    };
  },
});
</script>
