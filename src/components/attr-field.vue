<template>
  <component :is="control" v-bind="props"></component>
</template>

<script lang="ts">
import { Entities, EntityAttrType, FormField } from '@/share/entity';
import { DefineComponent, defineComponent, PropType } from 'vue';
import CheckboxField from '@/controls/checkbox-field.vue';
import DateField from '@/controls/date-field.vue';
import DateTimeField from '@/controls/date-time-field.vue';
import NumericField from '@/controls/numeric-field.vue';
import RadioField from '@/controls/radio-field.vue';
import RadioGroupField from '@/controls/radio-group-field.vue';
import SelectField from '@/controls/select-field.vue';
import TelField from '@/controls/tel-field.vue';
import TextareaField from '@/controls/textarea-field.vue';
import TextField from '@/controls/text-field.vue';
import TimeField from '@/controls/time-field.vue';
import UrlField from '@/controls/url-field.vue';
import PasswordField from '@/controls/password-field.vue';

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
