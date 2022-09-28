import { EntityAttrType, FormField } from "../entity.types";

const fakeFields = [
  {id: 'recordName', label: '记录名：', type: EntityAttrType.Text, value: '',}, 
  {id: 'fromDate', label:  '开始日期：', type: EntityAttrType.Date, value: '', required: true},
  {id: 'fromTime', label:  '开始时间：', type: EntityAttrType.Time, value: '00:00',  }, 
  {id: 'toDate', label:  '结束日期：', type: EntityAttrType.Date, value: '', required: true, }, 
  {id: 'toTime', label:  '结束时间：', type: EntityAttrType.Time, value: '00:00', }, 
];


export const getSearchForm = function() {
  return fakeFields.map(field => ({
    id: field.id,
    name: field.id,
    label: field.label,
    type: field.type,
    value: field.value,
    originValue: field.value,
    layout: {
      fieldLines:[EntityAttrType.Radio, EntityAttrType.Checkbox, EntityAttrType.RadioGroup].includes(field.type) ? 'none' : 'full',
      labelPosition: [EntityAttrType.Radio, EntityAttrType.Checkbox, EntityAttrType.RadioGroup].includes(field.type) ? 'fixed' :'stacked', // fixed, floating, stacked
      isHideLabel: false,
    },
    rules: {
      required: !!field.required
    },
    readonly: false,
    disabled: false,
  } as FormField));
};
