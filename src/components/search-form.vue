<template>
    <ion-list v-for="field in fields" :key="field.id" class="ion-padding-start ion-padding-end">
        <attr-field :field="field" :formName="entityName" style="--padding-start: 0; --padding-end: 0"></attr-field>
    </ion-list> 
</template>

<script lang="ts">
import AttrField from '@/components/attr-field.vue';
import { Entities, EntityAttrType, useEntityRecordsStore, useEntitySearchFormStore } from '@/share/entity';
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
      return true;
    }
    const schema = computed(() => {
      return fields.value.reduce((acc, field) => {
        acc[`${props.entityName}.${field.name}`] = validateFn;
        return acc;
      }, {} as any);
    });
    const { handleSubmit, resetForm } = useForm({
      validationSchema: schema
    });
    const onSubmit = handleSubmit(values => {      
      recordStore.getRecords(props.entityName, {isInit: true});
    });
    const onReset = () => {
      fields.value.forEach(field => {
        if ([EntityAttrType.Text, EntityAttrType.Textarea, EntityAttrType.Url].includes(field.type)) {
          field.value = '';
        }else if ([EntityAttrType.Checkbox, EntityAttrType.Radio].includes(field.type)) {
          field.value = false;
        }
        
      });
      resetForm();

      recordStore.getRecords(props.entityName, {});
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
