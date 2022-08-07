<template>
  <ion-radio-group :allowEmptySelection="true" :value="attrField.value"  @update:modelValue="change(attrField, $event)">
        <ion-list-header>
          <ion-label>
            {{ attrField.label }}
          </ion-label>
        </ion-list-header>
        <template v-for="option in attrField.options" :key="option.id">
          <ion-item>
            <ion-label>{{ option.value }}</ion-label>
            <ion-radio :value="option.id" ></ion-radio>
          </ion-item>
        </template>
      </ion-radio-group>
</template>

<script lang="ts">
import { Entities, FormField } from '@/share/entity';
import { IonRadio, IonListHeader, IonRadioGroup, IonLabel, IonItem, } from '@ionic/vue';
import { toRefs } from '@vue/reactivity';
import { defineComponent, PropType } from 'vue';
import { UpdateValueEventName, useVeeField } from './useVeeField';



export default defineComponent({
  name: 'RadioGroupField',
  components: { IonRadio, IonListHeader, IonRadioGroup, IonLabel, IonItem, },
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
