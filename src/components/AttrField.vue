
<template>
  <ion-item :lines="attrField.as !== 'input' ? 'none' : undefined">
    <ion-label :for="attrField.id">{{ attrField.label }}</ion-label>
      <template v-if="attrField.as === 'input'">
        <ion-input :type="attrField.type" :value="attrField.value" :name="attrField.name" :id="attrField.id" @update:modelValue="change(attrField, $event)"></ion-input>
      </template>
      <template v-if="attrField.as === 'checkbox'">
        <ion-checkbox slot="start" @update:modelValue="change(attrField, $event)" :value="attrField.value"
          :name="attrField.name">
        </ion-checkbox>
      </template>
      <template v-if="attrField.as === 'radio'">
        <ion-radio slot="start" color="success" :value="attrField.value" :name="attrField.name"  @update:modelValue="change(attrField, $event)"></ion-radio>
      </template>
  </ion-item>
  <!-- <p>{{ errors[attrField.name] }}</p> -->
</template>



<script lang="ts">
import { Entities, FormField } from '@/share/entity';
import { IonCheckbox, IonInput, IonRadio } from '@ionic/vue';
import { defineComponent, PropType } from 'vue';
import { useField } from "vee-validate";
import { IonItem, IonLabel } from '@ionic/vue';
import { toRefs } from '@vue/reactivity';




export default defineComponent({
  name: 'AttrField',
  components: { IonCheckbox, IonRadio, IonInput, IonItem, IonLabel },
  props: {
    entityName: { type: String as PropType<Entities>, required: true },
    field: { type: Object as PropType<FormField>, required: true },
  },
  setup(props) {
    const { field: attrField } = toRefs(props);
    const { value: veeField } = useField<FormField>(`${props.entityName}.${attrField.value.name}`);

    const change = (attr: FormField, value: any) => {
      attr.value = value;
      veeField.value = value;
    };
    return {
      attrField,
      change,
    };
  },
});
</script>
