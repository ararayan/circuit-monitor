<template>
  <ion-list>
    <ion-item style="--padding-start: 0" :lines="attrField.layout?.fieldLines" :class="{'fill-wrapper': attrField.layout?.isHideLabel}">
    <ion-label :for="attrField.id" :hidden="attrField.layout?.isHideLabel">{{ attrField.label }}</ion-label>
    <ion-input :readonly='attrField.readonly' :disabled="attrField.disabled" type="date" :required = "attrField?.rules?.required"
        :value="attrField.value" :name="attrField.name" :id="attrField.id" 
        @update:modelValue="change(attrField, $event)"></ion-input>
  </ion-item>
  <i class="ion-invalid invalid-text">{{inValidText}}</i>
  </ion-list>


</template>

<script lang="ts">
import { Entities, FormField } from '@/share/entity';
import { IonInput, IonItem, IonLabel, IonList } from '@ionic/vue';
import { ref, toRefs } from '@vue/reactivity';
import { defineComponent, PropType, watch } from 'vue';
import { UpdateValueEventName, useVeeField } from './useVeeField';



export default defineComponent({
  name: 'DateField',
  components: { IonInput, IonItem, IonLabel, IonList },
  props: {
    formName: { type: String as PropType<Entities | string>, required: true },
    field: { type: Object as PropType<FormField>, required: true },
  },
  emits: [UpdateValueEventName],
  setup(props, {emit}) {
    const { field: attrField } = toRefs(props);
    const { change, errorMessage } = useVeeField(attrField, props.formName, emit);
    const inValidText = ref<string>('');
    watch(errorMessage, (msg) => {
      if(!attrField.value.persistent && !!attrField.value.rules.required) {
        if (msg) {
          inValidText.value =  '无效，请重新输入。';
        }else {
          inValidText.value = '';
        }
      }

    });
    return {
      attrField,
      change,
      inValidText,
    };
  },
});
</script>


<style>
.fill-wrapper{
  --padding-start: 0;
  --inner-padding-end: 0;
}
.invalid-text {
  --padding-start: 0;
  display: block;
  color: var(--ion-color-danger);
  font-size: 0.85em;
}
.invalid-text:empty {
  display: none;
}
</style>
