import { Entities, FormField } from "@/share";
import { useField } from "vee-validate";
import { Ref } from "vue";

function useVeeField (attrField: Ref<FormField>, entityName: Entities) {
  const { value: veeField } = useField<FormField>(`${entityName}.${attrField.value.name}`);

  const change = (attr: FormField, value: any) => {
    attr.value = value;
    veeField.value = value;
  };

  return { change };
}

export { useVeeField };