
<template>
  <template v-if="attrField.as === 'radioGroup'">
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
  <template v-else>
  <ion-item :lines="['input', 'textarea'].includes(attrField.as) ? undefined : 'none'" >
    <ion-label :for="attrField.id">{{ attrField.label }}</ion-label>
    <template v-if="attrField.as === 'input'">
      <ion-input :readonly='attrField.readonly' :disabled="attrField.disabled" :type="attrField.type"
        :value="attrField.value" :name="attrField.name" :id="attrField.id"
        @update:modelValue="change(attrField, $event)"></ion-input>
    </template>
    <template v-else-if="attrField.as === 'checkbox'">
      <ion-checkbox slot="start" @update:modelValue="change(attrField, $event)" :value="attrField.value"
        :readonly='attrField.readonly' :disabled="attrField.disabled" :name="attrField.name">
      </ion-checkbox>
    </template>
    <template v-else-if="attrField.as === 'select'">
      <ion-select @update:modelValue="change(attrField, $event)" :value="attrField.value" :name="attrField.name"
        ok-text="Ok" cancel-text="Cancel" :readonly='attrField.readonly' :disabled="attrField.disabled">
        <template v-for="option in attrField.options" :key="option.id">
          <ion-select-option :value="option.id">{{ option.value }}</ion-select-option>
        </template>
      </ion-select>
    </template>
    <template v-else-if="attrField.as === 'textarea'">
      <ion-textarea :value="attrField.value" :readonly='attrField.readonly' :disabled="attrField.disabled" rows="2"
        :name="attrField.name" :id="attrField.id" @update:modelValue="change(attrField, $event)" :debounce="500">
      </ion-textarea>
      <!-- <ion-textarea rows="6" cols="20" placeholder="Enter any notes here..."></ion-textarea> -->
    </template>

    <template v-else-if="attrField.as === 'radio'">
      <ion-radio slot="start" color="success" :value="attrField.value" :name="attrField.name"
        @update:modelValue="change(attrField, $event)"></ion-radio>
    </template>

  </ion-item>
  </template>

  <!-- <p>{{ errors[attrField.name] }}</p> -->
</template>



<script lang="ts">
import { Entities, FormField } from '@/share/entity';
import { IonCheckbox, IonInput, IonRadio, IonSelect, IonSelectOption, IonTextarea, IonListHeader, IonRadioGroup } from '@ionic/vue';
import { defineComponent, PropType } from 'vue';
import { useField } from "vee-validate";
import { IonItem, IonLabel } from '@ionic/vue';
import { toRefs } from '@vue/reactivity';




export default defineComponent({
  name: 'AttrField',
  components: { IonCheckbox, IonRadio, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonTextarea, IonListHeader, IonRadioGroup},
  props: {
    entityName: { type: String as PropType<Entities>, required: true },
    field: { type: Object as PropType<FormField>, required: true },
    labelPosition: { type: String, required: false, default: 'fixed' }
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
