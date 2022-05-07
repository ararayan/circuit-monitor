<template>
  <ion-item :lines="attrField.layout?.fieldLines" >
    <ion-label :for="attrField.id">{{ attrField.label }}</ion-label>
      <ion-textarea :value="attrField.value" :readonly='attrField.readonly' :disabled="attrField.disabled" rows="2"
        :name="attrField.name" :id="attrField.id" @update:modelValue="change(attrField, $event)" :debounce="500">
      </ion-textarea>
  </ion-item>
</template>

<script lang="ts">
import { Entities, FormField } from '@/share/entity';
import { IonTextarea, IonItem, IonLabel } from '@ionic/vue';
import { toRefs } from '@vue/reactivity';
import { defineComponent, PropType } from 'vue';
import { useVeeField } from './useVeeField';



export default defineComponent({
  name: 'TextareaField',
  components: { IonTextarea, IonItem, IonLabel },
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