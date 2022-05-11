<template>
<Ion-item>
  <ion-label :for="attrField.id">{{ attrField.label }}</ion-label>
 <ion-radio slot="start" color="success" :value="attrField.value" :name="attrField.name"
        @update:modelValue="change(attrField, $event)"></ion-radio>
</Ion-item>

</template>

<script lang="ts">
import { Entities, FormField } from '@/share/entity';
import { IonRadio, IonLabel, IonItem, } from '@ionic/vue';
import { toRefs } from '@vue/reactivity';
import { defineComponent, PropType } from 'vue';
import { UpdateValueEventName, useVeeField } from './useVeeField';



export default defineComponent({
  name: 'RadioField',
  components: { IonRadio, IonLabel, IonItem },
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