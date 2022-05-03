<template>
  <ion-radio-group :allowEmptySelection="false" :value="attrField.value">
        <ion-list-header>
          <ion-label>
            {{ attrField.label }}
          </ion-label>
        </ion-list-header>
        <template v-for="option in attrField.options" :key="option.id">
          <ion-item>
            <ion-label>{{ option.value }}</ion-label>
            <ion-radio :value="option.id"></ion-radio>
          </ion-item>
        </template>
      </ion-radio-group>
</template>

<script lang="ts">
import { Entities, FormField } from '@/share/entity';
import { IonRadio, IonListHeader, IonRadioGroup, IonLabel, IonItem, } from '@ionic/vue';
import { toRefs } from '@vue/reactivity';
import { defineComponent, PropType } from 'vue';
import { useVeeField } from './useVeeField';



export default defineComponent({
  name: 'RadioGroupField',
  components: { IonRadio, IonListHeader, IonRadioGroup, IonLabel, IonItem, },
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