<template>
  <component :is="control" v-bind="props" v-on="on" ref="controlRef"></component>
</template>

<script lang="ts">
import { Entities, EntityAttrType, FormField } from '@/share/entity';
import { ComponentPublicInstance, DefineComponent, defineComponent, PropType, ref, Ref } from 'vue';
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

const EntityAttrControlMap: Record<EntityAttrType, any> = {
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

export const UpdateValueEventName = 'update:value';
export default defineComponent({
  name: 'AttrField',
  components: {CheckboxField, DateField, DateTimeField, NumericField, RadioField, RadioGroupField, SelectField, TelField, TextareaField, TextField, TimeField, UrlField },
  props: {
    formName: { type: String as PropType<Entities>, required: true },
    field: { type: Object as PropType<FormField>, required: true }
  },
  emits: [UpdateValueEventName],
  setup(props, { emit }) {
    const control = EntityAttrControlMap[props.field.type] || `can't find the control for field type: ${props.field.type}`;
    const controlRef = ref(null) as Ref<any> as Ref<ComponentPublicInstance>;
    const on = {
      [UpdateValueEventName]: (args: any) => {
        emit(UpdateValueEventName, args);
      }
    }
    return {
      control,
      props,
      on,
      controlRef,
    };
  }
});
</script>
