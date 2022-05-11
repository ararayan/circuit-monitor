
<template>
 <ion-item :lines="attrField.layout?.fieldLines" >
    <ion-label :for="attrField.id">{{ attrField.label }}</ion-label>
     <ion-select @update:modelValue="change(attrField, $event)" :value="attrField.value" :name="attrField.name"
        ok-text="Ok" cancel-text="Cancel" :readonly='attrField.readonly' :disabled="attrField.disabled">
        <template v-for="option in attrField.options" :key="option.id">
          <ion-select-option :value="option.id">{{ option.value }}</ion-select-option>
        </template>
      </ion-select>
  </ion-item>
</template>



<script lang="ts">
import { Entities, FormField } from '@/share/entity';
import { IonSelect, IonSelectOption, IonLabel, IonItem, } from '@ionic/vue';
import { toRefs } from '@vue/reactivity';
import { defineComponent, PropType } from 'vue';
import { UpdateValueEventName, useVeeField } from './useVeeField';



export default defineComponent({
  name: 'SelectField',
  components: { IonSelect, IonSelectOption, IonLabel, IonItem },
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
