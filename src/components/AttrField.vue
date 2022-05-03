<template>
  <component :is="control" v-bind="props"></component>
</template>

<script lang="ts">
import { Entities, EntityAttrType, FormField } from '@/share/entity';
import { DefineComponent, defineComponent, PropType } from 'vue';
import CheckboxField from '@/controls/CheckboxField.vue';
import DateField from '@/controls/DateField.vue';
import DateTimeField from '@/controls/DateTimeField.vue';
import NumericField from '@/controls/NumericField.vue';
import RadioField from '@/controls/RadioField.vue';
import RadioGroupField from '@/controls/RadioGroupField.vue';
import SelectField from '@/controls/SelectField.vue';
import TelField from '@/controls/TelField.vue';
import TextareaField from '@/controls/TextareaField.vue';
import TextField from '@/controls/TextField.vue';
import TimeField from '@/controls/TimeField.vue';
import UrlField from '@/controls/UrlField.vue';
import PasswordField from '@/controls/PasswordField.vue';

const EntityAttrControlMap: Record<EntityAttrType, DefineComponent<any, any, any>> = {
  [EntityAttrType.Text]: TextField,
  [EntityAttrType.Password]: PasswordField,
  [EntityAttrType.Numeric]: NumericField,
  [EntityAttrType.Textarea]: TextareaField,
  [EntityAttrType.Select]: SelectField,
  [EntityAttrType.Checkbox]: CheckboxField,
  [EntityAttrType.Radio]: RadioField,
  [EntityAttrType.RadioGroup]: RadioGroupField,
  [EntityAttrType.DateTime]: DateTimeField,
  [EntityAttrType.Date]: DateField,
  [EntityAttrType.Time]: TimeField,
  [EntityAttrType.Tel]: TelField,
  [EntityAttrType.Url]: UrlField,
};

export default defineComponent({
  name: 'AttrField',
  components: {CheckboxField, DateField, DateTimeField, NumericField, RadioField, RadioGroupField, SelectField, TelField, TextareaField, TextField, TimeField, UrlField },
  props: {
    entityName: { type: String as PropType<Entities>, required: true },
    field: { type: Object as PropType<FormField>, required: true }
  },
  setup(props) {
    const control = EntityAttrControlMap[props.field.type] || `can't find the control for field type: ${props.field.type}`;
    return {
      control,
      props
    };
  }
});
</script>
