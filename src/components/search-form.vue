<template>
    <ion-list v-for="field in fields" :key="field.id" class="ion-padding-start ion-padding-end">
        <attr-field :field="field" :formName="entityName" style="--padding-start: 0; --padding-end: 0"></attr-field>
    </ion-list> 
</template>

<script lang="ts">
import AttrField from '@/components/attr-field.vue';
import { Entities, EntityAttrType, FormField, useEntityRecordsStore, useEntitySearchFormStore } from '@/share/entity';
import { parse } from '@babel/parser';
import { IonList } from '@ionic/vue';
import { computed } from '@vue/reactivity';
import { storeToRefs } from 'pinia';
import { useForm } from "vee-validate";
import { defineComponent, onUnmounted, PropType } from 'vue';


// not export interface: node_modules\vee-validate\dist\vee-validate.d.ts
interface FieldValidationMetaInfo {
    field: string;
    value: unknown;
    form: Record<string, unknown>;
    rule?: {
        name: string;
        params?: Record<string, unknown> | unknown[];
    };
}

// sys form component contract interface
export interface SysFormComponent {
  onSubmit(): void;
  onReset(): void;
}

export default defineComponent({
  name: 'SearchForm',
  components: {
    IonList,
    AttrField,
  },
  props: {
    entityName: { type: String as PropType<Entities>, required: true },
  },
  setup(props) {
    const searchFormStore = useEntitySearchFormStore(props.entityName);
    const recordStore = useEntityRecordsStore(props.entityName);
    const { searchForm: fields } = storeToRefs(searchFormStore);
    searchFormStore.getSearchForm(props.entityName);
    // validate
    function validateFn(value: any, ctx: FieldValidationMetaInfo) {
      const [ , fieldId] = ctx.field.split('.');
      const isRequired = !!fields.value.find(x => x.id === fieldId)?.rules?.required;
      const isValid = isRequired ? value !== undefined : true;
      return isValid;
    }
    const schema = computed(() => {
      return fields.value.reduce((acc, field) => {
        acc[`${props.entityName}.${field.name}`] = validateFn;
        return acc;
      }, {} as any);
    });
    const { handleSubmit, resetForm } = useForm({
      validationSchema: schema,
    });
    const onSubmit = handleSubmit(() => {     
      const changedFields = fields.value;
      let criteria = {} as Record<string, string>;
      if (changedFields.length) {
        criteria = changedFields.reduce((acc, field) => {
          if (field.type === EntityAttrType.Date) {
            acc[field.id] = (field.value as string)?.replace(/-/gm, '') || ''; //2022-09-14 to 20220914
          }else if(field.type === EntityAttrType.Time) {
            const [hoursStr, minutesStr] = (field.value as string).split(':'); //13:04
            const hours = parseInt(hoursStr);
            const minutes = parseInt(minutesStr);
            if (!isNaN(hours) && !isNaN(minutes)) {
              const milliseconds = hours * 60 * 60 * 60 + minutes * 60 * 60;
              acc[field.id] = milliseconds.toString();
            }
          }else {
            acc[field.id] = field.value?.toString() || '';
          }
          return acc;
        }, {} as Record<string, string>);
      }
      recordStore.getRecords(props.entityName, {criteria: criteria, isInit: true});
    });
    const onReset = () => {
      fields.value.forEach(field => {
        field.value = field.originValue;
      });
      resetForm();
      recordStore.clearRecords();
    };
    const componentInterface: SysFormComponent = {
      onSubmit,
      onReset,
    };
    onUnmounted(() => {
      searchFormStore.destroy();
    });
    return {
      fields,
      ...componentInterface,
    };
  },
});
</script>
