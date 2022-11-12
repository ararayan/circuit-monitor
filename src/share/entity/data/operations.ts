import { ControlStatusIds } from "../entity-edit-form.store";
import { EntityAttrType, FormField } from "../entity.types";

export enum ControlStatusCode {
  Fen = 'fen',
  He = 'he',
  FenWx = 'fen(wx)',
  HeWx = 'he(Wx)',
}

export const ControlStatusCodeTexts: Record<ControlStatusCode, string> = {
  [ControlStatusCode.Fen]: '分闸',
  [ControlStatusCode.He]: '合闸',
  [ControlStatusCode.FenWx]: '分(无效)',
  [ControlStatusCode.HeWx]: '合(无效)',
};

export const ControlStatusCodeIds: Record<ControlStatusCode.Fen | ControlStatusCode.He, keyof ControlStatusIds> = {
  fen: 'kfId',
  he: 'khId',
  // wx: '无效',
};


export const editForm: FormField[] = [
  {id: 'changzhan', label: '厂站：', name: 'factoryName', type: EntityAttrType.Text, value: '', originValue: '', readonly: true, disabled: false, persistent: true },
  {id: 'dianming', label: '点名：', name: 'location', type: EntityAttrType.Text, value: '', originValue: '', readonly: true, disabled: false, persistent: true  },
  {id: 'status', label: '当前状态：', name: 'currentStatus', type: EntityAttrType.Text, value: '', originValue: '', readonly: true, disabled: false, persistent: true  },
  {id: 'controlType', label: '遥控类型：', name: 'currentStatus', type: EntityAttrType.Select, value: 'control3', originValue: 'control3', readonly: false, disabled: false, persistent: true, 
    options: [
      {id: 'control1', value: '遥控1'},
      {id: 'control2', value: '遥控2'},
      {id: 'control3', value: '其它'},
    ]
  },
  {id: 'zhaStatus', label: '操作类型：', name: 'powerSwitch', type: EntityAttrType.RadioGroup, value: '', originValue: '', readonly: false, disabled: false, persistent: true, 
    options: [
      {id: 'fen', value: ControlStatusCodeTexts.fen},
      {id: 'he', value: ControlStatusCodeTexts.he},
    ] },
];
