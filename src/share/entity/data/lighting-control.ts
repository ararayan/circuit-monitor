import { EntityAttrType, FormField } from "../entity.types";

const fakeFields = [
  {text: '记录名：', type: EntityAttrType.Text, value: '', }, 
  {text:  '数量：', type: EntityAttrType.Text, value: '', }, 
  {text:  '开始日期：', type: EntityAttrType.DateTime, value: '', }, 
  {text:  '结束日期：', type: EntityAttrType.DateTime, value: '', }, 
  {text:  '实施中', type: EntityAttrType.Checkbox, value: false, }, 
];

export const searchForm = Array.from({ length: 5 }).map((_, i) => ({
  id: `col${i}`,
  label: fakeFields[i].text,
  name: `col${i}`,
  type: fakeFields[i].type,
  value: fakeFields[i].value,
  layout: {
    fieldLines:[EntityAttrType.Radio, EntityAttrType.Checkbox, EntityAttrType.RadioGroup].includes(fakeFields[i].type) ? 'none' : 'full',
    labelPosition: [EntityAttrType.Radio, EntityAttrType.Checkbox, EntityAttrType.RadioGroup].includes(fakeFields[i].type) ? 'fixed' :'stacked', // fixed, floating, stacked
    isHideLabel: false,
  },
  rules: {},
  readonly: false,
  disabled: false,
} as FormField));