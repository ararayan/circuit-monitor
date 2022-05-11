<template>
 <ion-item :lines="attrField.layout?.fieldLines" >
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
import { UpdateValueEventName, useVeeField } from './useVeeField';



export default defineComponent({
  name: 'DateField',
  components: { IonInput, IonItem, IonLabel },
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