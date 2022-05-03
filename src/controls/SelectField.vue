
<template>
  <ion-item :lines="['input', 'textarea'].includes(attrField.type) ? undefined : 'none'" >
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
import { useVeeField } from './useVeeField';



export default defineComponent({
  name: 'SelectField',
  components: { IonSelect, IonSelectOption, IonLabel, IonItem },
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
