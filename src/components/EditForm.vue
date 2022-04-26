<template>
    <ion-list v-for="field in fields" :key="field.id">
      <attr-field :field="field" :entityName="entityName"></attr-field>
    </ion-list> 
</template>

<script lang="ts">
import { Entities, getEntityStore } from '@/share/entity';
import { IonList } from '@ionic/vue';
import { storeToRefs } from 'pinia';
import { defineComponent, PropType } from 'vue';
// import { useForm } from "vee-validate";
// import { computed } from '@vue/reactivity';
import AttrField from './AttrField.vue';


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
    entityName: { type: String as PropType<Entities>, required: true },
  },
  setup(props) {
    const entityStore = getEntityStore(props.entityName);
    entityStore.getEditForm(props.entityName);
    const { editForm: fields } = storeToRefs(entityStore);
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
