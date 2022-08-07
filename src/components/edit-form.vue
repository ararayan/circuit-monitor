<template>
    <ion-list v-for="field in fields" :key="field.id">
      <attr-field :field="field" :formName="entityName"></attr-field>
    </ion-list> 
</template>

<script lang="ts">
import { Entities, FormField, useEntityEditFormStore } from '@/share/entity';
import { IonList } from '@ionic/vue';
import { storeToRefs } from 'pinia';
import { defineComponent, onUnmounted, PropType, toRefs } from 'vue';
// import { useForm } from "vee-validate";
// import { computed } from '@vue/reactivity';
import AttrField from '@/components/attr-field.vue';


// not export interface: node_modules\vee-validate\dist\vee-validate.d.ts
// interface FieldValidationMetaInfo {
//     field: string;
//     value: unknown;
//     form: Record<string, unknown>;
//     rule?: {
//         name: string;
//         params?: Record<string, unknown> | unknown[];
//     };
// }



export default defineComponent({
  name: 'EditForm',
  components: {
    IonList,
    AttrField,
  },
  props: {
    formFields: {type: Array as PropType<FormField[]>, required: true},
    entityName: { type: String as PropType<Entities>, required: true },
    recordId: { type: String, required: true },
  },
  setup(props) {
    // const entityStore = useEntityEditFormStore(props.entityName, props.recordId);
    // entityStore.getEditForm(props.entityName);
    // const { editForm: fields } = storeToRefs(entityStore);
    const {formFields: fields} = toRefs(props);
    // validate
    // function validateFn(value: any, ctx: FieldValidationMetaInfo) {
    //   return true;
    // }
    // const schema = computed(() => {
    //   return fields.value.reduce((acc, field) => {
    //     acc[`${props.entityName}.${field.name}`] = validateFn;
    //     return acc;
    //   }, {} as any);
    // });
    // const { handleSubmit, resetForm } = useForm({
    //   validationSchema: schema
    // });
    // const onSubmit = handleSubmit(values => {
    //   debugger;
    // });
    // const componentInterface = {
    //   onSubmit,
    // };
    return {
      fields,
    //   ...componentInterface,
    };
  },
});
</script>
