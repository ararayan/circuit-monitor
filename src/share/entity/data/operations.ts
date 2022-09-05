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
  persistent: true,
} as FormField));

export enum ControlStatusCode {
  Fen = 'fen',
  He = 'he',
  Wx = 'wx'
}

export const ControlStatusTextMap: Record<ControlStatusCode, string> = {
  fen: '分闸',
  he: '合闸',
  wx: '无效',
};



export const editForm: FormField[] = [
  {id: 'changzhan', label: '厂站：', name: 'factoryName', type: EntityAttrType.Text, value: '', readonly: true, disabled: false, persistent: true },
  // {id: 'description', label: '描述：', name: 'description', type: EntityAttrType.Text, value: '2号主变高后备314_开关操作', readonly: true, disabled: false, persistent: true  },
  {id: 'dianming', label: '点名：', name: 'location', type: EntityAttrType.Text, value: '',  readonly: true, disabled: false, persistent: true  },
  {id: 'status', label: '当前状态：', name: 'currentStatus', type: EntityAttrType.Text, value: '',  readonly: true, disabled: false, persistent: true  },
  {id: 'controlType', label: '遥控类型：', name: 'currentStatus', type: EntityAttrType.Select, value: 'control3',  readonly: false, disabled: false, persistent: true, 
    options: [
      {id: 'control1', value: '遥控1'},
      {id: 'control2', value: '遥控2'},
      {id: 'control3', value: '其它'},
    ]
  },
  {id: 'zhaStatus', label: '操作类型：', name: 'powerSwitch', type: EntityAttrType.RadioGroup, value: '',  readonly: false, disabled: false, persistent: true, 
    options: [
      {id: 'fen', value: ControlStatusTextMap.fen},
      {id: 'he', value: ControlStatusTextMap.he},
    ] },
];
