import { Entities, FormField } from "@/share";
import { useField } from "vee-validate";
import { Ref } from "vue";

export const UpdateValueEventName = 'update:value';

function useVeeField<T extends (name: typeof UpdateValueEventName, ...args: any[]) => void>(attrField: Ref<FormField>, formName: Entities | string, emit: T) {
  const { value: veeField, errorMessage } = useField<FormField>(`${formName}.${attrField.value.name}`);
  
  const change = (attr: FormField, value: string) => {
    attr.persistent = false;
    attr.value = value;
    veeField.value = attr;
    emit(UpdateValueEventName, value);
  };

  return { change, errorMessage };
}

export { useVeeField };
